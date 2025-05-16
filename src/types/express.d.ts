/**
 * Express Type Extensions
 * Adds custom properties to Express Request interface
 */

import { User } from '../models';
import { Request } from 'express';

declare global {
  namespace Express {
    // Override the Express.User interface to match our User model
    interface User extends Omit<import('../models').User, 'password_hash'> {}

    // Add user property to Request interface
    interface Request {
      user?: User;
      db?: any; // For database client in middleware
    }
  }
}

// Make this a proper module
export {};