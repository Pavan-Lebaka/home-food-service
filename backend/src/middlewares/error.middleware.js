import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

/**
 * 404 Not Found Middleware for unmatched routes
 */
export const notFoundHandler = (req, res, next) => {
  const error = new ApiError(
    HTTP_STATUS.NOT_FOUND,
    `Route ${req.method} ${req.originalUrl} not found on this server`
  );
  next(error);
};

/**
 * Global Centralized Error Handler
 */
export const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;

  if (!(err instanceof ApiError)) {
    statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    message = err.message || 'Internal Server Error';
  }

  const response = {
    success: false,
    statusCode,
    message,
    errors: err.errors || [],
    ...(env.isDev && { stack: err.stack })
  };

  if (!env.isDev && statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    console.error('[UNHANDLED ERROR]', err);
  }

  res.status(statusCode).json(response);
};
