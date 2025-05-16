/**
 * Validation Helper
 * Helper functions for handling validation errors
 */

import { ValidationError as ExpressValidationError, Result, ValidationChain } from 'express-validator';
import { BadRequestError } from './errorHandler';

interface CustomValidationError {
  path: string;
  msg: string;
  [key: string]: any;
}

/**
 * Format validation errors from express-validator to a more usable format
 */
export function formatValidationErrors(errors: Result<ExpressValidationError>): Record<string, string> {
  if (errors.isEmpty()) return {}; // Return empty object instead of null
  
  // Create an object with path as key and error message as value
  const errorMap: Record<string, string> = {};
  for (const error of errors.array()) {
    if ('path' in error) {
      errorMap[error.path] = error.msg;
    } else if ('param' in error) {
      // Fallback for older express-validator versions
      errorMap[error.param as string] = error.msg;
    } else {
      // Unknown error format
      errorMap['unknown'] = error.msg;
    }
  }
  
  return errorMap;
}

/**
 * Check validation results and throw a BadRequestError if validation fails
 */
export function handleValidationErrors(errors: Result<ExpressValidationError>) {
  const formattedErrors = formatValidationErrors(errors);
  if (formattedErrors) {
    throw new BadRequestError('Validation error', formattedErrors);
  }
}

/**
 * Express middleware to handle validation errors
 */
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export function validateRequest(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = formatValidationErrors(errors);
    return next(new BadRequestError('Validation failed', formattedErrors));
  }
  return next();
}

/**
 * Combine validation chains with the validation middleware
 */
export function validate(validations: ValidationChain[]) {
  return [
    ...validations,
    validateRequest
  ];
}