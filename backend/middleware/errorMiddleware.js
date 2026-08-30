const { errorResponse } = require('../utils/apiResponse');

/**
 * 404 Not Found Middleware
 */
const notFound = (req, res, next) => {
  return errorResponse(res, 404, `Route not found - ${req.originalUrl}`);
};

/**
 * Centralized Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  let message = err.message || 'Internal Server Error';

  // Handle Body-parser JSON Syntax Error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON payload in request body';
  }

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  // Handle Mongoose Duplicate Key Error (code 11000)
  if (err.code === 11000) {
    statusCode = 400;
    const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'field';
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired';
  }

  if (process.env.NODE_ENV === 'development') {
    console.error(`[Error] ${req.method} ${req.originalUrl} - ${message}`);
  }

  return errorResponse(res, statusCode, message);
};

module.exports = {
  notFound,
  errorHandler,
};
