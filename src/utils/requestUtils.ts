/**
 * Request Utilities
 * Helper functions for working with Express requests
 */

import { Request } from 'express';
import { UnauthorizedError } from './errorHandler';

/**
 * Get the authenticated user from the request
 * Throws an UnauthorizedError if no user is present
 */
export function getAuthUser(req: Request) {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }
  return req.user;
}

/**
 * Check if the authenticated user has admin privileges
 * Throws an UnauthorizedError if no user is present or if user doesn't have admin privileges
 */
export function checkIsAdmin(req: Request) {
  const user = getAuthUser(req);
  
  if (!user.isAdmin) {
    throw new UnauthorizedError('Admin privileges required');
  }
  
  return true;
}

/**
 * Check if the authenticated user has moderator privileges
 * Throws an UnauthorizedError if no user is present or if user doesn't have moderator privileges
 */
export function checkIsModerator(req: Request) {
  const user = getAuthUser(req);
  
  if (!user.isModerator && !user.isAdmin) {
    throw new UnauthorizedError('Moderator privileges required');
  }
  
  return true;
}