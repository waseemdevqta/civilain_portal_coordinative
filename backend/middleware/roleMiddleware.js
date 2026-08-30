const { errorResponse } = require('../utils/apiResponse');

/**
 * Require Officer role middleware
 * Returns 403 when an authenticated citizen attempts an officer-only route
 */
const requireOfficer = (req, res, next) => {
  if (req.user && req.user.role === 'officer') {
    return next();
  }
  return errorResponse(res, 403, 'Forbidden: Officer access required for this action.');
};

/**
 * Require Citizen role middleware
 * Returns 403 when an authenticated non-citizen attempts a citizen-only route
 */
const requireCitizen = (req, res, next) => {
  if (req.user && req.user.role === 'citizen') {
    return next();
  }
  return errorResponse(res, 403, 'Forbidden: Citizen access required for this action.');
};

module.exports = {
  requireOfficer,
  requireCitizen,
};
