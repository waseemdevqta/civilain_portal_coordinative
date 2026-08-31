const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * GET /api/staff
 * Super officer: list all officers + technicians
 * Regular officer: list only their assigned technicians
 */
const getStaff = async (req, res) => {
  try {
    let query;
    if (req.user.isSuperOfficer) {
      // Super officer sees everyone except citizens
      query = User.find({ role: { $in: ['officer', 'technician'] } })
        .populate('assignedOfficer', 'name email designation')
        .sort({ role: 1, name: 1 });
    } else {
      // Regular officer sees only their technicians
      query = User.find({ role: 'technician', assignedOfficer: req.user._id })
        .sort({ name: 1 });
    }
    const staff = await query.lean();
    return successResponse(res, 200, 'Staff list fetched.', { staff });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

/**
 * POST /api/staff/provision
 * Super officer only — create officer or technician account
 * Body: { name, email, password, role ('officer'|'technician'), designation, phone, assignedOfficerId? }
 */
const provisionStaff = async (req, res) => {
  try {
    const { name, email, password, role, designation, phone, assignedOfficerId } = req.body;

    if (!name || !email || !password || !role) {
      return errorResponse(res, 400, 'name, email, password and role are required.');
    }

    if (!['officer', 'technician'].includes(role)) {
      return errorResponse(res, 400, 'Role must be either "officer" or "technician".');
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return errorResponse(res, 409, 'An account with this email already exists.');
    }

    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
      designation: designation || '',
      phone: phone || '',
    };

    // If provisioning a technician, validate and set their assigned officer
    if (role === 'technician' && assignedOfficerId) {
      const officer = await User.findOne({ _id: assignedOfficerId, role: 'officer' });
      if (!officer) {
        return errorResponse(res, 404, 'Assigned officer not found.');
      }
      userData.assignedOfficer = assignedOfficerId;
    }

    const newUser = await User.create(userData);

    return successResponse(res, 201, `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully.`, {
      user: newUser,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

/**
 * PATCH /api/staff/:id/assign-officer
 * Super officer only — assign a technician to an officer
 * Body: { officerId }
 */
const assignOfficerToTechnician = async (req, res) => {
  try {
    const { id } = req.params;
    const { officerId } = req.body;

    const technician = await User.findOne({ _id: id, role: 'technician' });
    if (!technician) {
      return errorResponse(res, 404, 'Technician not found.');
    }

    if (officerId) {
      const officer = await User.findOne({ _id: officerId, role: 'officer' });
      if (!officer) {
        return errorResponse(res, 404, 'Officer not found.');
      }
      technician.assignedOfficer = officerId;
    } else {
      technician.assignedOfficer = null; // unassign
    }

    await technician.save();
    const updated = await User.findById(id).populate('assignedOfficer', 'name email');

    return successResponse(res, 200, 'Technician assignment updated.', { technician: updated });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

/**
 * DELETE /api/staff/:id
 * Super officer only — remove an officer or technician
 * Cannot remove the super officer themselves
 */
const removeStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const target = await User.findById(id);
    if (!target) {
      return errorResponse(res, 404, 'Staff member not found.');
    }

    if (target.isSuperOfficer) {
      return errorResponse(res, 403, 'The super officer account cannot be removed.');
    }

    if (target.role === 'citizen') {
      return errorResponse(res, 400, 'Citizen accounts cannot be removed via this endpoint.');
    }

    await User.findByIdAndDelete(id);
    return successResponse(res, 200, 'Staff member removed successfully.');
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

/**
 * GET /api/staff/officers
 * Super officer: list officers only (for dropdowns)
 */
const getOfficers = async (req, res) => {
  try {
    const officers = await User.find({ role: 'officer' })
      .select('name email designation phone isSuperOfficer')
      .sort({ name: 1 })
      .lean();
    return successResponse(res, 200, 'Officers fetched.', { officers });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

/**
 * GET /api/staff/technicians
 * Officer: list their technicians (for assign dropdown on complaints)
 */
const getMyTechnicians = async (req, res) => {
  try {
    const filter = req.user.isSuperOfficer
      ? { role: 'technician' } // super officer can assign any technician
      : { role: 'technician', assignedOfficer: req.user._id };

    const technicians = await User.find(filter)
      .select('name email designation phone assignedOfficer')
      .populate('assignedOfficer', 'name')
      .sort({ name: 1 })
      .lean();

    return successResponse(res, 200, 'Technicians fetched.', { technicians });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

module.exports = {
  getStaff,
  provisionStaff,
  assignOfficerToTechnician,
  removeStaff,
  getOfficers,
  getMyTechnicians,
};
