/**
 * Logger Configuration
 * Sets up application logging
 */

import winston from 'winston';
import express from 'express';
import env from './environment';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  env.NODE_ENV === 'development'
    ? winston.format.colorize()
    : winston.format.uncolorize(),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} ${level}: ${message} ${stack || ''}`;
  })
);

// Configure transport options based on environment
const transports = [];

// Console transport for all environments
transports.push(
  new winston.transports.Console({
    level: env.LOG_LEVEL,
  })
);

// File transport for non-development environments
if (env.NODE_ENV !== 'development') {
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      level: env.LOG_LEVEL,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: logFormat,
  transports,
  exitOnError: false,
});

// Add request logging middleware function
export function requestLogger(req: express.Request, res: express.Response, next: express.NextFunction) {
  const start = Date.now();
  
  // Log when the request completes
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`,
      {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration,
        ip: req.ip,
        userAgent: req.get('user-agent') || '',
      }
    );
  });
  
  next();
}

export default logger;