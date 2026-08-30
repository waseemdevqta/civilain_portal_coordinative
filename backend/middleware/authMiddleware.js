const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Protect routes - requires valid JWT Bearer access token in Authorization header
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2) {
      token = parts[1];
    }
  }

  if (!token) {
    return errorResponse(res, 401, 'Not authorized to access this route. No token provided.');
  }

  try {
    const secret =
      process.env.JWT_ACCESS_SECRET ||
      process.env.JWT_SECRET ||
      '6e14e2576f3aef1aa21f9ac3c470db70eb6979f41a003f61cdff75d0fd5f215f';

    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id);

    if (!user) {
      return errorResponse(res, 401, 'User belonging to this token no longer exists.');
    }

    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, 401, 'Not authorized, access token is invalid or expired.');
  }
};

module.exports = {
  protect,
};
