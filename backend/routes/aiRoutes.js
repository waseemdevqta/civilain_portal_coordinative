const express = require('express');
const router = express.Router();
const { getOfficerSummary } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const { requireOfficer } = require('../middleware/roleMiddleware');

// Officer AI Briefing summary route
router.post('/officer-summary', protect, requireOfficer, getOfficerSummary);

module.exports = router;
