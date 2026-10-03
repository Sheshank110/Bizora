import logger from '../utils/logger.js';
import env from '../config/env.js';

/**
 * Centralized error handler middleware.
 * Must be registered last in the middleware chain.
 */
const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.isOperational ? err.message : 'An unexpected error occurred';

  // Log server errors
  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} — ${err.message}`, {
      stack: err.stack,
    });
  } else if (env.isDev) {
    logger.debug(`${req.method} ${req.originalUrl} — ${statusCode} ${message}`);
  }

  const response = {
    success: false,
    message,
    code,
  };

  // Include validation details if present
  if (err.details) {
    response.details = err.details;
  }

  // Include stack trace only in development for non-operational errors
  if (env.isDev && !err.isOperational) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export default errorHandler;
