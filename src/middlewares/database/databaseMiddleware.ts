/**
 * Database Middleware
 * Provides database client to request objects
 */

import { Request, Response, NextFunction } from 'express';
import db from '../../config/database';
import logger from '../../config/logger';

/**
 * Middleware that attaches a database client to the request object
 */
export async function attachDatabaseClient(req: Request, res: Response, next: NextFunction) {
  try {
    // Attach the database module to the request
    req.db = db;
    next();
  } catch (error) {
    logger.error('Error attaching database client:', error);
    next(error);
  }
}

/**
 * Middleware that creates a transaction and attaches to request
 * This is useful for routes that need to perform multiple database operations atomically
 */
export async function withTransaction(req: Request, res: Response, next: NextFunction) {
  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');
    
    // Store the client on the request
    req.db = client;
    
    // Store original end method
    const originalEnd = res.end;
    
    // Override end method to commit or rollback transaction
    res.end = function(...args: any[]): Response {
      // Restore original end method
      res.end = originalEnd;
      
      // Extract arguments
      const chunk = args[0];
      const cb = typeof args[1] === 'function' ? args[1] : 
                (typeof args[2] === 'function' ? args[2] : undefined);
      
      // Use a any-typed function to avoid TypeScript signature issues
      const callOriginal = () => {
        // @ts-ignore - workaround for type compatibility issues
        return originalEnd.apply(res, args);
      };
      
      // If there was no error, commit the transaction
      if (res.statusCode < 400) {
        client.query('COMMIT')
          .then(() => {
            client.release();
            return callOriginal();
          })
          .catch(err => {
            logger.error('Error committing transaction:', err);
            client.query('ROLLBACK')
              .then(() => {
                client.release();
                return callOriginal();
              })
              .catch(rollbackErr => {
                logger.error('Error rolling back transaction:', rollbackErr);
                client.release();
                return callOriginal();
              });
          });
      } else {
        // If there was an error, rollback the transaction
        client.query('ROLLBACK')
          .then(() => {
            client.release();
            return callOriginal();
          })
          .catch(err => {
            logger.error('Error rolling back transaction:', err);
            client.release();
            return callOriginal();
          });
      }
      
      return res;
    };
    
    next();
  } catch (error) {
    await client.query('ROLLBACK');
    client.release();
    logger.error('Error setting up transaction:', error);
    next(error);
  }
}