const { generateOfficerBriefing, analyzeComplaintDraft } = require('../config/gemini');
const { computeComplaintsStats } = require('./complaintController');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * @desc    Generate an AI operational summary / briefing for government officers
 * @route   POST /api/ai/officer-summary
 * @access  Private (Officer only)
 */
const getOfficerSummary = async (req, res, next) => {
  try {
    // 1. Calculate aggregated statistics strictly without citizen PII
    const rawStats = await computeComplaintsStats();

    // 2. Prepare clean operational data payload
    const operationalData = {
      totalComplaints: rawStats.total,
      pending: rawStats.pending,
      inProgress: rawStats.inProgress,
      resolved: rawStats.resolved,
      critical: rawStats.critical,
      high: rawStats.high,
      complaintsToday: rawStats.complaintsToday,
      averageFeedbackRating: rawStats.averageFeedbackRating,
      topCategories: rawStats.topCategories.slice(0, 5),
      topAreas: rawStats.topAreas.slice(0, 5),
    };

    // 3. Generate concise briefing with Gemini API
    const summary = await generateOfficerBriefing(operationalData);

    return successResponse(res, 200, 'AI officer briefing generated successfully', {
      summary,
      stats: operationalData,
    });
  } catch (error) {
    if (error.statusCode === 503) {
      return errorResponse(
        res,
        503,
        error.message || 'Gemini AI is not configured. Please set GEMINI_API_KEY.'
      );
    }
    next(error);
  }
};

/**
 * @desc    Analyze citizen draft complaint to suggest category, hazards, and priority
 * @route   POST /api/ai/analyze-complaint
 * @access  Private (Citizen only)
 */
const analyzeComplaint = async (req, res, next) => {
  try {
    const { title, description, area } = req.body;

    if (!description && !title) {
      return errorResponse(res, 400, 'Please provide at least a title or description to analyze');
    }

    const analysis = await analyzeComplaintDraft({ title, description, area });

    return successResponse(res, 200, 'Complaint analyzed successfully', analysis);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOfficerSummary,
  analyzeComplaint,
};
