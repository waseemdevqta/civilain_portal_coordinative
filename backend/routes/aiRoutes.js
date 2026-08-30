const express = require('express');
const router = express.Router();
const { getOfficerSummary, analyzeComplaint } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const { requireOfficer, requireCitizen } = require('../middleware/roleMiddleware');

// Officer AI Briefing summary route
router.post('/officer-summary', protect, requireOfficer, getOfficerSummary);

// Citizen AI Smart Triage Assistant route
router.post('/analyze-complaint', protect, requireCitizen, analyzeComplaint);

module.exports = router;
