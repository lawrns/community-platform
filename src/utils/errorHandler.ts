/**
 * Error Handler
 * Custom error classes and middleware for the application
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import env from '../config/environment';

/**
 * Base Application Error class
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, true);
  }
}

/**
 * Bad Request Error (400)
 */
export class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(message, 400, true);
  }
}

/**
 * Unauthorized Error (401)
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, true);
  }
}

/**
 * Forbidden Error (403)
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, true);
  }
}

/**
 * Validation Error (422)
 */
export class ValidationError extends AppError {
  errors: Record<string, string>;

  constructor(message = 'Validation error', errors: Record<string, string> = {}) {
    super(message, 422, true);
    this.errors = errors;
  }
}

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Set default error values
  let statusCode = 500;
  let message = 'Something went wrong';
  let errorDetails = {};
  let isOperational = false;

  // Handle specific known errors
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
    
    // Add validation errors if available
    if (err instanceof ValidationError) {
      errorDetails = { errors: err.errors };
    }
  }
  
  // Log error
  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.path} - ${statusCode}: ${err.message}`, {
      stack: err.stack,
      error: err
    });
  } else {
    logger.warn(`${req.method} ${req.path} - ${statusCode}: ${err.message}`);
  }

  // Prepare response object
  const response = {
    success: false,
    status: statusCode,
    message,
    ...errorDetails,
    // Include stack trace in development
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  // Send response
  res.status(statusCode).json(response);
}

/**
 * 404 Not Found middleware
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
}