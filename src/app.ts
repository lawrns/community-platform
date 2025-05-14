/**
 * Application Entry Point
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';

import env from './config/environment';
import { requestLogger } from './config/logger';
import { errorHandler, notFoundHandler } from './utils/errorHandler';
import { configurePassport } from './middlewares/auth/authMiddleware';
import apiRoutes from './routes/api';
import { notificationService } from './services/notifications/notificationService';
import { notificationScheduler } from './services/notifications/scheduledJobs';

// Create Express application
const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true
}));

// Rate limiting
app.use(rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
}));

// Parse request body
app.use(express.json({ limit: `${env.MAX_UPLOAD_SIZE}b` }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Compression
app.use(compression());

// Request logging
app.use(requestLogger);

// Configure session and passport
app.use(session({
  secret: env.AUTH_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  }
}));

// Initialize and configure Passport
app.use(passport.initialize());
app.use(passport.session());
configurePassport();

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', environment: env.NODE_ENV });
});

// API routes
app.use('/api', apiRoutes);

// Swagger documentation route
if (env.NODE_ENV !== 'production') {
  // Setup Swagger UI in non-production environments (will be added later)
}

// 404 handler for unmatched routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;