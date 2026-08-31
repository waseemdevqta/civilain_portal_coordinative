const { errorResponse } = require('../utils/apiResponse');

/**
 * Require Officer role middleware (includes super officer)
 */
const requireOfficer = (req, res, next) => {
  if (req.user && req.user.role === 'officer') {
    return next();
  }
  return errorResponse(res, 403, 'Forbidden: Officer access required for this action.');
};

/**
 * Require Citizen role middleware
 */
const requireCitizen = (req, res, next) => {
  if (req.user && req.user.role === 'citizen') {
    return next();
  }
  return errorResponse(res, 403, 'Forbidden: Citizen access required for this action.');
};

/**
 * Require Super Officer middleware
 * Only the root super officer (isSuperOfficer: true) can access these routes
 */
const requireSuperOfficer = (req, res, next) => {
  const isSuper =
    req.user &&
    req.user.role === 'officer' &&
    (req.user.isSuperOfficer === true ||
      (process.env.SEED_OFFICER_EMAIL &&
        req.user.email?.toLowerCase() === process.env.SEED_OFFICER_EMAIL.toLowerCase()) ||
      req.user.email?.toLowerCase() === 'waseemahmedbaloch2004@gmail.com');

  if (isSuper) {
    return next();
  }
  return errorResponse(res, 403, 'Forbidden: Super Officer access required for this action.');
};

/**
 * Require Officer or Super Officer (any officer-level access)
 */
const requireOfficerOrAbove = (req, res, next) => {
  if (req.user && req.user.role === 'officer') {
    return next();
  }
  return errorResponse(res, 403, 'Forbidden: Officer-level access required.');
};

/**
 * Require Technician role middleware
 */
const requireTechnician = (req, res, next) => {
  if (req.user && req.user.role === 'technician') {
    return next();
  }
  return errorResponse(res, 403, 'Forbidden: Technician access required for this action.');
};

/**
 * Require Officer or Technician (field staff access)
 */
const requireFieldStaff = (req, res, next) => {
  if (req.user && (req.user.role === 'officer' || req.user.role === 'technician')) {
    return next();
  }
  return errorResponse(res, 403, 'Forbidden: Field staff access required.');
};

module.exports = {
  requireOfficer,
  requireCitizen,
  requireSuperOfficer,
  requireOfficerOrAbove,
  requireTechnician,
  requireFieldStaff,
};
