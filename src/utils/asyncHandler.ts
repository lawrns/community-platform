/**
 * Async Handler Utility
 * Wraps async route handlers to catch errors and pass them to the error middleware
 */

import { Request, Response, NextFunction } from 'express';

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

/**
 * Wraps an async function to catch errors and pass them to Express error handler
 */
export default function asyncHandler(fn: AsyncHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// For backwards compatibility
export { asyncHandler };