const express = require('express');
const router = express.Router();
const { signup, login, addOfficer, refreshTokenHandler, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { requireOfficer } = require('../middleware/roleMiddleware');

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh', refreshTokenHandler);

// Protected routes
router.get('/me', protect, getMe);

// Officer internal provisioning route (Only authenticated officers can create other officers)
router.post('/add-officer', protect, requireOfficer, addOfficer);

module.exports = router;
