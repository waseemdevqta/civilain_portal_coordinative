const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');
const { attachPriority, calculatePriority } = require('../utils/priority');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const VALID_CATEGORIES = ['road', 'garbage', 'water', 'electricity', 'other'];
const VALID_STATUSES = ['pending', 'in-progress', 'resolved'];

/**
 * Helper to compute aggregated complaints statistics
 */
const computeComplaintsStats = async () => {
  const allComplaints = await Complaint.find({});

  const total = allComplaints.length;
  let pending = 0;
  let inProgress = 0;
  let resolved = 0;
  let critical = 0;
  let high = 0;
  let complaintsToday = 0;
  let feedbackSum = 0;
  let feedbackCount = 0;

  const categoryCounts = {};
  const areaCounts = {};

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  for (const complaint of allComplaints) {
    // Status counts
    if (complaint.status === 'pending') pending++;
    else if (complaint.status === 'in-progress') inProgress++;
    else if (complaint.status === 'resolved') resolved++;

    // Priority counts (dynamic calculation)
    const { priority } = calculatePriority(complaint);
    if (priority === 'critical') critical++;
    else if (priority === 'high') high++;

    // Complaints today
    if (complaint.createdAt && new Date(complaint.createdAt) >= startOfToday) {
      complaintsToday++;
    }

    // Top categories
    if (complaint.category) {
      categoryCounts[complaint.category] = (categoryCounts[complaint.category] || 0) + 1;
    }

    // Top areas
    if (complaint.area) {
      const normalizedArea = complaint.area.trim();
      areaCounts[normalizedArea] = (areaCounts[normalizedArea] || 0) + 1;
    }

    // Feedback rating average
    if (complaint.feedbackGiven && typeof complaint.feedbackRating === 'number') {
      feedbackSum += complaint.feedbackRating;
      feedbackCount++;
    }
  }

  const topCategories = Object.entries(categoryCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const topAreas = Object.entries(areaCounts)
    .map(([area, count]) => ({ area, count }))
    .sort((a, b) => b.count - a.count);

  const averageFeedbackRating = feedbackCount > 0
    ? Number((feedbackSum / feedbackCount).toFixed(1))
    : 0;

  return {
    total,
    pending,
    inProgress,
    resolved,
    critical,
    criticalPriority: critical,
    high,
    complaintsToday,
    topCategories,
    topAreas,
    averageFeedbackRating,
    averageRating: averageFeedbackRating,
  };
};

/**
 * @desc    Create a new complaint
 * @route   POST /api/complaints
 * @access  Private (Citizen only)
 */
const createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, area, imageUrl, imagePublicId } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return errorResponse(res, 400, 'Please provide a complaint title');
    }

    if (!description || typeof description !== 'string' || description.trim() === '') {
      return errorResponse(res, 400, 'Please provide a complaint description');
    }

    if (!category || !VALID_CATEGORIES.includes(category)) {
      return errorResponse(
        res,
        400,
        `Invalid category. Allowed categories: ${VALID_CATEGORIES.join(', ')}`
      );
    }

    if (!area || typeof area !== 'string' || area.trim() === '') {
      return errorResponse(res, 400, 'Please provide an area or location');
    }

    const complaint = await Complaint.create({
      title: title.trim(),
      description: description.trim(),
      category,
      area: area.trim(),
      imageUrl: imageUrl && typeof imageUrl === 'string' ? imageUrl.trim() : '',
      imagePublicId: imagePublicId && typeof imagePublicId === 'string' ? imagePublicId.trim() : '',
      status: 'pending',
      createdBy: req.user._id,
      upvotes: 0,
      upvotedBy: [],
    });

    const populatedComplaint = await Complaint.findById(complaint._id).populate(
      'createdBy',
      'name email'
    );

    return successResponse(
      res,
      201,
      'Complaint created successfully',
      attachPriority(populatedComplaint)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all complaints with filters and sorting
 * @route   GET /api/complaints
 * @access  Public
 */
const getComplaints = async (req, res, next) => {
  try {
    const { search, category, status, area, sort } = req.query;

    const query = {};

    if (category && VALID_CATEGORIES.includes(category)) {
      query.category = category;
    }

    if (status && VALID_STATUSES.includes(status)) {
      query.status = status;
    }

    if (area && typeof area === 'string' && area.trim() !== '') {
      query.area = { $regex: area.trim(), $options: 'i' };
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { area: searchRegex },
      ];
    }

    let sortOption = { createdAt: -1 }; // default recent
    if (sort === 'upvotes') {
      sortOption = { upvotes: -1, createdAt: -1 };
    } else if (sort === 'recent') {
      sortOption = { createdAt: -1 };
    }

    const complaints = await Complaint.find(query)
      .sort(sortOption)
      .populate('createdBy', 'name email')
      .populate('assignedTechnician', 'name email designation phone');

    const formattedComplaints = complaints.map(attachPriority);

    // If sort by priority score
    if (sort === 'priority') {
      formattedComplaints.sort((a, b) => b.priorityScore - a.priorityScore);
    }

    return successResponse(
      res,
      200,
      'Complaints retrieved successfully',
      formattedComplaints
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user's submitted complaints
 * @route   GET /api/complaints/mine
 * @access  Private (Citizen only)
 */
const getMyComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email')
      .populate('assignedTechnician', 'name email designation phone');

    const formattedComplaints = complaints.map(attachPriority);

    return successResponse(
      res,
      200,
      'My complaints retrieved successfully',
      formattedComplaints
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single complaint by ID
 * @route   GET /api/complaints/:id
 * @access  Public
 */
const getComplaintById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, 'Invalid complaint ID format');
    }

    const complaint = await Complaint.findById(id)
      .populate('createdBy', 'name email')
      .populate('assignedTechnician', 'name email designation phone');

    if (!complaint) {
      return errorResponse(res, 404, 'Complaint not found');
    }

    return successResponse(
      res,
      200,
      'Complaint retrieved successfully',
      attachPriority(complaint)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upvote a complaint
 * @route   PATCH /api/complaints/:id/upvote
 * @access  Private (Citizen only)
 */
const upvoteComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, 'Invalid complaint ID format');
    }

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return errorResponse(res, 404, 'Complaint not found');
    }

    // Check if user has already upvoted
    const userIdStr = req.user._id.toString();
    const hasUpvoted = complaint.upvotedBy.some(
      (uid) => uid.toString() === userIdStr
    );

    if (hasUpvoted) {
      return errorResponse(res, 400, 'You have already upvoted this complaint');
    }

    // Atomic increment
    complaint.upvotes = (complaint.upvotes || 0) + 1;
    complaint.upvotedBy.push(req.user._id);

    await complaint.save();

    const populatedComplaint = await Complaint.findById(complaint._id).populate(
      'createdBy',
      'name email'
    );

    return successResponse(
      res,
      200,
      'Complaint upvoted successfully',
      attachPriority(populatedComplaint)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update complaint status and officer remarks
 * @route   PATCH /api/complaints/:id/status
 * @access  Private (Officer only)
 */
const updateComplaintStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, officerRemark, remark, resolutionImageUrl, resolutionImagePublicId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, 'Invalid complaint ID format');
    }

    if (!status || !VALID_STATUSES.includes(status)) {
      return errorResponse(
        res,
        400,
        `Invalid status. Allowed statuses: ${VALID_STATUSES.join(', ')}`
      );
    }

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return errorResponse(res, 404, 'Complaint not found');
    }

    complaint.status = status;
    const effectiveRemark = officerRemark !== undefined ? officerRemark : remark;
    if (effectiveRemark !== undefined) {
      complaint.officerRemark = typeof effectiveRemark === 'string' ? effectiveRemark.trim() : '';
    }

    if (resolutionImageUrl !== undefined) {
      complaint.resolutionImageUrl = typeof resolutionImageUrl === 'string' ? resolutionImageUrl.trim() : '';
    }
    if (resolutionImagePublicId !== undefined) {
      complaint.resolutionImagePublicId = typeof resolutionImagePublicId === 'string' ? resolutionImagePublicId.trim() : '';
    }

    if (status === 'resolved') {
      complaint.feedbackPending = !complaint.feedbackGiven;
      complaint.resolvedAt = complaint.resolvedAt || new Date();
    } else {
      // Reverted from resolved back to pending/in-progress
      complaint.feedbackPending = false;
      complaint.resolvedAt = null;
    }

    await complaint.save();

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('createdBy', 'name email')
      .populate('assignedTechnician', 'name email designation phone');

    return successResponse(
      res,
      200,
      'Complaint status updated successfully',
      attachPriority(populatedComplaint)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit citizen feedback for resolved complaint
 * @route   PATCH /api/complaints/:id/feedback
 * @access  Private (Citizen author only)
 */
const submitFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, 'Invalid complaint ID format');
    }

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return errorResponse(res, 404, 'Complaint not found');
    }

    // Only the creator can submit feedback
    if (complaint.createdBy.toString() !== req.user._id.toString()) {
      return errorResponse(
        res,
        403,
        'Forbidden: You can only submit feedback for your own complaints'
      );
    }

    // Feedback only allowed when resolved
    if (complaint.status !== 'resolved') {
      return errorResponse(
        res,
        400,
        'Feedback can only be submitted for resolved complaints'
      );
    }

    // Prevent submitting feedback multiple times
    if (complaint.feedbackGiven) {
      return errorResponse(
        res,
        400,
        'Feedback has already been submitted for this complaint'
      );
    }

    const numericRating = Number(rating);
    if (!rating || isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return errorResponse(res, 400, 'Rating must be an integer between 1 and 5');
    }

    complaint.feedbackRating = Math.round(numericRating);
    complaint.feedbackComment = comment && typeof comment === 'string' ? comment.trim() : '';
    complaint.feedbackGiven = true;
    complaint.feedbackPending = false;

    await complaint.save();

    const populatedComplaint = await Complaint.findById(complaint._id).populate(
      'createdBy',
      'name email'
    );

    return successResponse(
      res,
      200,
      'Feedback submitted successfully',
      attachPriority(populatedComplaint)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Find duplicate active complaints by category and area
 * @route   GET /api/complaints/duplicates
 * @access  Private (Citizen only)
 */
const detectDuplicates = async (req, res, next) => {
  try {
    const { category, area } = req.query;

    if (!category || !area) {
      return successResponse(res, 200, 'Duplicate check completed', { duplicates: [] });
    }

    const trimmedCategory = category.trim();
    const trimmedArea = area.trim();

    const duplicates = await Complaint.find({
      category: trimmedCategory,
      area: { $regex: `^${trimmedArea}$`, $options: 'i' },
      status: { $in: ['pending', 'in-progress'] },
    }).populate('createdBy', 'name email');

    const formatted = duplicates.map(attachPriority);

    return successResponse(res, 200, 'Duplicate check completed', {
      duplicates: formatted,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get officer statistics
 * @route   GET /api/complaints/stats
 * @access  Public
 */
const getOfficerStats = async (req, res, next) => {
  try {
    const stats = await computeComplaintsStats();
    return successResponse(res, 200, 'Officer statistics retrieved', stats);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get neighborhood cluster hotspot density
 * @route   GET /api/complaints/hotspots
 * @access  Public
 */
const getHotspots = async (req, res, next) => {
  try {
    const allComplaints = await Complaint.find({});
    const areaMap = {};

    for (const c of allComplaints) {
      const area = (c.area || 'General').trim();
      if (!areaMap[area]) {
        areaMap[area] = {
          area,
          total: 0,
          pending: 0,
          inProgress: 0,
          resolved: 0,
          critical: 0,
          high: 0,
          upvotes: 0,
          categories: {},
        };
      }

      areaMap[area].total++;
      areaMap[area].upvotes += c.upvotes || 0;
      if (c.status === 'pending') areaMap[area].pending++;
      else if (c.status === 'in-progress') areaMap[area].inProgress++;
      else if (c.status === 'resolved') areaMap[area].resolved++;

      const { priority } = calculatePriority(c);
      if (priority === 'critical') areaMap[area].critical++;
      else if (priority === 'high') areaMap[area].high++;

      if (c.category) {
        areaMap[area].categories[c.category] = (areaMap[area].categories[c.category] || 0) + 1;
      }
    }

    const hotspots = Object.values(areaMap).map((item) => {
      const resolutionRate = item.total > 0 ? Math.round((item.resolved / item.total) * 100) : 0;
      const topCategory = Object.entries(item.categories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'other';

      let riskLevel = 'normal';
      if (item.critical >= 2 || item.total >= 5) riskLevel = 'critical';
      else if (item.high >= 2 || item.total >= 3) riskLevel = 'elevated';

      return {
        area: item.area,
        total: item.total,
        pending: item.pending,
        inProgress: item.inProgress,
        resolved: item.resolved,
        critical: item.critical,
        high: item.high,
        upvotes: item.upvotes,
        resolutionRate,
        topCategory,
        riskLevel,
      };
    }).sort((a, b) => b.critical - a.critical || b.total - a.total);

    return successResponse(res, 200, 'Hotspots retrieved successfully', hotspots);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export complaints as CSV
 * @route   GET /api/complaints/export
 * @access  Private (Officer only)
 */
const exportComplaintsCSV = async (req, res, next) => {
  try {
    const { category, status } = req.query;
    const query = {};

    if (category && VALID_CATEGORIES.includes(category)) {
      query.category = category;
    }
    if (status && VALID_STATUSES.includes(status)) {
      query.status = status;
    }

    const complaints = await Complaint.find(query)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');

    const headers = [
      'Ticket ID',
      'Complaint ID',
      'Title',
      'Category',
      'Area',
      'Status',
      'Priority Level',
      'Priority Score',
      'Upvotes Count',
      'Reported By Name',
      'Reported By Email',
      'Created At',
      'Updated At',
      'Image Evidence URL',
      'Resolution Image URL',
      'Officer Remark',
      'Citizen Feedback Rating',
      'Citizen Feedback Comment',
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = complaints.map((c) => {
      const { priority, priorityScore } = calculatePriority(c);
      return [
        escapeCsv(`CF-${c._id.toString().slice(-6).toUpperCase()}`),
        escapeCsv(c._id.toString()),
        escapeCsv(c.title),
        escapeCsv(c.category),
        escapeCsv(c.area),
        escapeCsv(c.status),
        escapeCsv(priority),
        escapeCsv(priorityScore),
        escapeCsv(c.upvotes || 0),
        escapeCsv(c.createdBy?.name || 'Citizen'),
        escapeCsv(c.createdBy?.email || ''),
        escapeCsv(c.createdAt ? new Date(c.createdAt).toISOString() : ''),
        escapeCsv(c.updatedAt ? new Date(c.updatedAt).toISOString() : ''),
        escapeCsv(c.imageUrl || ''),
        escapeCsv(c.resolutionImageUrl || ''),
        escapeCsv(c.officerRemark || ''),
        escapeCsv(c.feedbackRating || ''),
        escapeCsv(c.feedbackComment || ''),
      ].join(',');
    });

    const csvContent = [headers.map((h) => `"${h}"`).join(','), ...rows].join('\r\n');

    const todayStr = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="complaints_export_${todayStr}.csv"`
    );

    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/complaints/:id/assign
 * Officer or super officer assigns a technician to a complaint
 * Body: { technicianId } — pass null to unassign
 */
const assignTechnician = async (req, res) => {
  try {
    const User = require('../models/User');
    const { technicianId } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return errorResponse(res, 404, 'Complaint not found.');

    if (technicianId) {
      const tech = await User.findOne({ _id: technicianId, role: 'technician' });
      if (!tech) return errorResponse(res, 404, 'Technician not found.');

      // Regular officer can only assign their own technicians
      if (!req.user.isSuperOfficer) {
        const techOfficerId = tech.assignedOfficer?.toString();
        if (techOfficerId !== req.user._id.toString()) {
          return errorResponse(res, 403, 'You can only assign technicians under your command.');
        }
      }
      complaint.assignedTechnician = technicianId;
    } else {
      complaint.assignedTechnician = null;
    }

    await complaint.save();
    const updated = await Complaint.findById(complaint._id)
      .populate('assignedTechnician', 'name email designation phone')
      .populate('createdBy', 'name email');

    return successResponse(res, 200, 'Technician assignment updated.', { complaint: updated });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getMyComplaints,
  getComplaintById,
  upvoteComplaint,
  updateComplaintStatus,
  submitFeedback,
  detectDuplicates,
  getOfficerStats,
  getHotspots,
  exportComplaintsCSV,
  computeComplaintsStats,
  assignTechnician,
};
