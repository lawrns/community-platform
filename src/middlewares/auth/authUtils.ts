/**
 * Auth Utilities
 * Helper functions for working with authenticated requests
 */

import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../../utils/errorHandler';

/**
 * Get the authenticated user from the request
 * Throws an UnauthorizedError if no user is present
 * 
 * @param req Express request object
 * @returns The authenticated user
 * @throws UnauthorizedError if user is not present
 */
export function getAuthUser(req: Request) {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }
  return req.user;
}

/**
 * Middleware that ensures the request has a valid authenticated user
 * Use this after authenticate middleware for additional type safety
 */
export function requireAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }
  return next();
}

/**
 * Middleware that ensures the user has admin privileges
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }
  
  if (!req.user.isAdmin) {
    return next(new ForbiddenError('Admin privileges required'));
  }
  
  return next();
}

/**
 * Middleware that ensures the user has moderator privileges
 */
export function requireModerator(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }
  
  if (!req.user.isAdmin && !req.user.isModerator) {
    return next(new ForbiddenError('Moderator privileges required'));
  }
  
  return next();
}

/**
 * Middleware that ensures the user is the owner of the specified resource
 * or has admin privileges
 * 
 * @param getUserId Function that extracts the owner user ID from the request
 */
export function requireOwnerOrAdmin(getUserId: (req: Request) => number | Promise<number>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }
    
    try {
      const resourceUserId = await Promise.resolve(getUserId(req));
      
      if (req.user.id !== resourceUserId && !req.user.isAdmin) {
        return next(new ForbiddenError('You do not have permission to access this resource'));
      }
      
      return next();
    } catch (error) {
      return next(error);
    }
  };
}