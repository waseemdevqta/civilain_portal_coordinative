const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;

/**
 * @desc    Register a new citizen
 * @route   POST /api/auth/signup
 * @access  Public (Citizen only)
 */
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return errorResponse(res, 400, 'Please provide a valid name');
    }

    if (!email || typeof email !== 'string' || email.trim() === '') {
      return errorResponse(res, 400, 'Please provide an email address');
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return errorResponse(res, 400, 'Please provide a valid email format');
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return errorResponse(res, 400, 'Password must be at least 6 characters long');
    }

    // Check duplicate email
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return errorResponse(res, 400, 'A user with this email address already exists');
    }

    // Public signup is strictly restricted to citizen role
    const user = await User.create({
      name: name.trim(),
      email: trimmedEmail,
      password,
      role: 'citizen',
    });

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);

    return successResponse(res, 201, 'User registered successfully', {
      accessToken,
      token: accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get tokens
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, 'Please provide email and password');
    }

    const trimmedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    const user = await User.findOne({ email: trimmedEmail }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);

    return successResponse(res, 200, 'Login successful', {
      accessToken,
      token: accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Provision a new officer (Restricted to authenticated officers only)
 * @route   POST /api/auth/add-officer
 * @access  Private (Officer only)
 */
const addOfficer = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return errorResponse(res, 400, 'Please provide a valid officer name');
    }

    if (!email || typeof email !== 'string' || email.trim() === '') {
      return errorResponse(res, 400, 'Please provide an official email address');
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return errorResponse(res, 400, 'Please provide a valid email format');
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return errorResponse(res, 400, 'Password must be at least 6 characters long');
    }

    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return errorResponse(res, 400, 'A user with this email address already exists');
    }

    const officer = await User.create({
      name: name.trim(),
      email: trimmedEmail,
      password,
      role: 'officer',
    });

    return successResponse(res, 201, 'Officer account provisioned successfully', {
      user: {
        id: officer._id,
        name: officer.name,
        email: officer.email,
        role: officer.role,
        createdAt: officer.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Refresh access token using a valid refresh token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
const refreshTokenHandler = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return errorResponse(res, 400, 'Refresh token is required');
    }

    const refreshSecret =
      process.env.JWT_REFRESH_SECRET ||
      'ae635afda89f6e30e854d18fce8a1466698c200ff6f5c4fa0e3cfeeffc7145e6';

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, refreshSecret);
    } catch (err) {
      return errorResponse(res, 401, 'Invalid or expired refresh token');
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return errorResponse(res, 401, 'User no longer exists');
    }

    const newAccessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id, user.role);

    return successResponse(res, 200, 'Token refreshed successfully', {
      accessToken: newAccessToken,
      token: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    return successResponse(res, 200, 'Current user profile retrieved', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  addOfficer,
  refreshTokenHandler,
  getMe,
};
