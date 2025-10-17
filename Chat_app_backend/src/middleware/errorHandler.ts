import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ResponseHelper } from '../utils/response';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e: any) => ({
      field: e.path,
      message: e.message
    }));
    ResponseHelper.validationError(res, 'Validation failed', errors);
    return;
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    ResponseHelper.conflict(res, `${field} already exists`);
    return;
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    ResponseHelper.notFound(res, 'Invalid ID format');
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    ResponseHelper.unauthorized(res, 'Invalid token');
    return;
  }

  if (err.name === 'TokenExpiredError') {
    ResponseHelper.unauthorized(res, 'Token expired');
    return;
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    ResponseHelper.error(res, 'File too large', 400);
    return;
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    ResponseHelper.error(res, 'Too many files', 400);
    return;
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    ResponseHelper.error(res, 'Unexpected file field', 400);
    return;
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  ResponseHelper.error(res, message, statusCode);
};
