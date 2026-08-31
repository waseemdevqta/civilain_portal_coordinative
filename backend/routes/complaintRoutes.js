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
  assignTechnician,
  getTechnicianTasks,
} = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');
const {
  requireOfficer,
  requireCitizen,
  requireOfficerOrAbove,
  requireFieldStaff,
} = require('../middleware/roleMiddleware');

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

// Get logged-in technician's assigned tasks (Technician or Officer)
router.get('/assigned-to-me', protect, requireFieldStaff, getTechnicianTasks);

// Detect duplicate active complaints (Citizen only)
router.get('/duplicates', protect, requireCitizen, detectDuplicates);

// Officer statistics (Officer only)
router.get('/stats', protect, requireOfficer, getOfficerStats);

// 2. Parameterized routes by :id

// Get single complaint details (Public)
router.get('/:id', getComplaintById);

// Upvote complaint (Citizen only)
router.patch('/:id/upvote', protect, requireCitizen, upvoteComplaint);

// Update complaint status & resolution proof remarks (Field Staff: Officer or Technician)
router.patch('/:id/status', protect, requireFieldStaff, updateComplaintStatus);

// Submit citizen feedback (Citizen only)
router.patch('/:id/feedback', protect, requireCitizen, submitFeedback);

// Assign technician to complaint (Officer or Super Officer)
router.patch('/:id/assign', protect, requireOfficerOrAbove, assignTechnician);

module.exports = router;
