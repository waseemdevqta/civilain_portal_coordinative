const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireOfficerOrAbove, requireSuperOfficer } = require('../middleware/roleMiddleware');
const {
  getStaff,
  provisionStaff,
  assignOfficerToTechnician,
  removeStaff,
  getOfficers,
  getMyTechnicians,
} = require('../controllers/staffController');

// All staff routes require authentication + officer-level access
router.use(protect, requireOfficerOrAbove);

// GET /api/staff — list all staff (super = everyone, officer = own technicians)
router.get('/', getStaff);

// GET /api/staff/officers — list officers (super officer only, used for dropdowns)
router.get('/officers', requireSuperOfficer, getOfficers);

// GET /api/staff/technicians — list technicians under the requesting officer
router.get('/technicians', getMyTechnicians);

// POST /api/staff/provision — create officer (super officer only) or technician
router.post('/provision', provisionStaff);

// PATCH /api/staff/:id/assign-officer — assign technician to officer (super officer only)
router.patch('/:id/assign-officer', requireSuperOfficer, assignOfficerToTechnician);

// DELETE /api/staff/:id — remove staff member (super officer only)
router.delete('/:id', requireSuperOfficer, removeStaff);

module.exports = router;
