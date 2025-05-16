/**
 * Simple Server
 * A basic server to test the web server functionality without database connections
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import logger from './config/logger';

// Create Express application
const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Parse request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Welcome to Community.io API', 
    version: '0.1.0' 
  });
});

// Example taxonomy routes
app.get('/api/tags', (req, res) => {
  res.json({
    success: true,
    tags: [
      { id: 1, name: 'javascript', slug: 'javascript', usage_count: 100 },
      { id: 2, name: 'python', slug: 'python', usage_count: 80 },
      { id: 3, name: 'machine-learning', slug: 'machine-learning', usage_count: 65 },
      { id: 4, name: 'react', slug: 'react', usage_count: 50 },
      { id: 5, name: 'node.js', slug: 'nodejs', usage_count: 45 },
    ]
  });
});

app.get('/api/topics', (req, res) => {
  res.json({
    success: true,
    topics: [
      { 
        id: 1, 
        name: 'Artificial Intelligence', 
        slug: 'artificial-intelligence',
        children: [
          { id: 2, name: 'Machine Learning', slug: 'machine-learning' },
          { id: 3, name: 'Natural Language Processing', slug: 'nlp' }
        ]
      },
      { 
        id: 4, 
        name: 'Web Development', 
        slug: 'web-development',
        children: [
          { id: 5, name: 'Frontend', slug: 'frontend' },
          { id: 6, name: 'Backend', slug: 'backend' }
        ]
      },
    ]
  });
});

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Resource not found' 
  });
});

// Error handler
app.use((err: Error & { status?: number, errors?: any }, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const statusCode = err.status || 500;
  logger.error(`Error: ${err.message}`);
  
  res.status(statusCode).json({
    success: false,
    message: err.message,
    errors: err.errors,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  logger.info(`Simple server running on port ${PORT}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
  logger.info(`API: http://localhost:${PORT}/api`);
});