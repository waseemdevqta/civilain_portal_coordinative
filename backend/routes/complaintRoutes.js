const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');
const { requireOfficer, requireCitizen } = require('../middleware/roleMiddleware');

// 1. Static / specific routes (must be defined before /:id)

// Create a complaint (Citizen only)
router.post('/', protect, requireCitizen, createComplaint);

// Get all complaints with filters/sorting (Public)
router.get('/', getComplaints);

// Export complaints as CSV (Officer only)
router.get('/export', protect, requireOfficer, exportComplaintsCSV);

// Get neighborhood cluster hotspot density (Public)
router.get('/hotspots', getHotspots);

// Get logged-in citizen's complaints (Citizen only)
router.get('/mine', protect, requireCitizen, getMyComplaints);

// Detect duplicate active complaints (Citizen only)
router.get('/duplicates', protect, requireCitizen, detectDuplicates);

// Officer statistics (Officer only)
router.get('/stats', protect, requireOfficer, getOfficerStats);

// 2. Parameterized routes by :id

// Get single complaint details (Public)
router.get('/:id', getComplaintById);

// Upvote complaint (Citizen only)
router.patch('/:id/upvote', protect, requireCitizen, upvoteComplaint);

// Update complaint status & remarks (Officer only)
router.patch('/:id/status', protect, requireOfficer, updateComplaintStatus);

// Submit citizen feedback (Citizen only)
router.patch('/:id/feedback', protect, requireCitizen, submitFeedback);

module.exports = router;
