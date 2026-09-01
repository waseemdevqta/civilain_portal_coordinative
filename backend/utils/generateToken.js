const jwt = require('jsonwebtoken');

/**
 * Generate Access JWT token with user ID and role
 * @param {string} id - User ID
 * @param {string} role - User role ('citizen' | 'officer')
 * @returns {string} Signed JWT access token
 */
const generateAccessToken = (id, role = 'citizen') => {
  return jwt.sign(
    { id, role },
    process.env.JWT_ACCESS_SECRET ||
      process.env.JWT_SECRET ||
      '6e14e2576f3aef1aa21f9ac3c470db70eb6979f41a003f61cdff75d0fd5f215f',
    {
      expiresIn:
        process.env.JWT_ACCESS_EXPIRES_IN ||
        process.env.JWT_EXPIRES_IN ||
        '1h',
    }
  );
};

const generateToken = generateAccessToken;

/**
 * Generate Refresh JWT token
 * @param {string} id - User ID
 * @param {string} role - User role ('citizen' | 'officer' | 'technician')
 * @returns {string} Signed JWT refresh token
 */
const generateRefreshToken = (id, role = 'citizen') => {
  return jwt.sign(
    { id, role },
    process.env.JWT_REFRESH_SECRET ||
      'ae635afda89f6e30e854d18fce8a1466698c200ff6f5c4fa0e3cfeeffc7145e6',
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    }
  );
};

module.exports = generateAccessToken;
module.exports.generateToken = generateToken;
module.exports.generateAccessToken = generateAccessToken;
module.exports.generateRefreshToken = generateRefreshToken;
