/**
 * Validation Middleware
 * Middleware functions for request validation
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { BadRequestError } from '../../utils/errorHandler';

/**
 * Format validation errors into a structured object
 */
export function formatValidationErrors(req: Request) {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return null;
  }

  // Handle different error types safely
  const errorMap: Record<string, string> = {};
  errors.array().forEach(err => {
    // For regular ValidationError
    if ('path' in err) {
      errorMap[err.path] = err.msg;
    }
    // For legacy ValidationError with param
    else if ('param' in err) {
      errorMap[err.param as string] = err.msg;
    }
    // Handle other cases
    else {
      errorMap['unknown'] = err.msg;
    }
  });

  return errorMap;
}

/**
 * Middleware to validate request based on express-validator validation chains
 */
export function validate(validations: ValidationChain[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Execute all validations
    await Promise.all(validations.map(validation => validation.run(req)));
    
    // Check for validation errors
    const errors = formatValidationErrors(req);
    
    if (errors) {
      return next(new BadRequestError('Validation error', errors));
    }
    
    return next();
  };
}

/**
 * Middleware to validate a request and return errors if any
 */
export function validateRequest(req: Request, res: Response, next: NextFunction) {
  const errors = formatValidationErrors(req);
  
  if (errors) {
    return next(new BadRequestError('Validation error', errors));
  }
  
  return next();
}