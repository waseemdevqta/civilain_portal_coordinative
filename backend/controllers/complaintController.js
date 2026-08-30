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
    high,
    complaintsToday,
    topCategories,
    topAreas,
    averageFeedbackRating,
  };
};

/**
 * @desc    Create a new complaint
 * @route   POST /api/complaints
 * @access  Private (Citizen only)
 */
const createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, area } = req.body;

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
      .populate('createdBy', 'name email');

    const formattedComplaints = complaints.map(attachPriority);

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
 * @desc    Get current citizen's complaints
 * @route   GET /api/complaints/mine
 * @access  Private (Citizen only)
 */
const getMyComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');

    const formattedComplaints = complaints.map(attachPriority);

    return successResponse(
      res,
      200,
      'User complaints retrieved successfully',
      formattedComplaints
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single complaint details
 * @route   GET /api/complaints/:id
 * @access  Public
 */
const getComplaintById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, 'Invalid complaint ID format');
    }

    const complaint = await Complaint.findById(id).populate('createdBy', 'name email');

    if (!complaint) {
      return errorResponse(res, 404, 'Complaint not found');
    }

    return successResponse(
      res,
      200,
      'Complaint details retrieved successfully',
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

    // Check if citizen already upvoted
    const userIdStr = req.user._id.toString();
    const hasUpvoted = complaint.upvotedBy.some(
      (uid) => uid.toString() === userIdStr
    );

    if (hasUpvoted) {
      return errorResponse(res, 400, 'You have already upvoted this complaint');
    }

    complaint.upvotedBy.push(req.user._id);
    complaint.upvotes = (complaint.upvotes || 0) + 1;
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
 * @desc    Update complaint status (Officer only)
 * @route   PATCH /api/complaints/:id/status
 * @access  Private (Officer only)
 */
const updateComplaintStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, remark } = req.body;

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
    if (remark !== undefined) {
      complaint.officerRemark = typeof remark === 'string' ? remark.trim() : '';
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

    const populatedComplaint = await Complaint.findById(complaint._id).populate(
      'createdBy',
      'name email'
    );

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
      area: { $regex: trimmedArea, $options: 'i' },
      status: { $in: ['pending', 'in-progress'] },
    })
      .limit(10)
      .populate('createdBy', 'name email');

    const formattedDuplicates = duplicates.map(attachPriority);

    return successResponse(res, 200, 'Duplicate complaints found', {
      duplicates: formattedDuplicates,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get aggregated statistics for complaints (Officer only)
 * @route   GET /api/complaints/stats
 * @access  Private (Officer only)
 */
const getOfficerStats = async (req, res, next) => {
  try {
    const stats = await computeComplaintsStats();
    return successResponse(res, 200, 'Officer statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
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
  computeComplaintsStats,
};
