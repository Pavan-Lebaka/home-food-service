import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

export const requireAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authentication required. No Bearer token provided.');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid token format.');
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (!decoded || !decoded.isAdmin) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Forbidden: Admin privilege required.');
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid or tampered token.'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Session expired. Please log in again.'));
    }
    next(error);
  }
};
