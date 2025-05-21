/**
 * Server Entry Point
 * Starts the application server
 */

import app from './app';
import env from './config/environment';
import logger from './config/logger';
import db from './config/database';
import cache from './config/cache';
import { createServer } from 'http';
import { notificationService } from './services/notifications/notificationService';
import { notificationScheduler } from './services/notifications/scheduledJobs';
import { dailyBriefScheduler } from './services/recommendations/scheduledJobs';

/**
 * Start server and initialize services
 */
async function startServer() {
  try {
    // Initialize database
    await db.initialize();
    
    // Create HTTP server
    const httpServer = createServer(app);
    
    // Initialize notification service with server for WebSockets
    notificationService.initialize(httpServer);
    
    // Start notification scheduler
    notificationScheduler.start();
    
    // Start daily brief scheduler
    dailyBriefScheduler.start();
    
    // Start HTTP server (supports --port CLI flag)
    const portIndex = process.argv.indexOf('--port');
    const portArg   = portIndex > -1 ? process.argv[portIndex + 1] : undefined;
    const port      = portArg ? Number(portArg) : env.PORT;

    const server = httpServer.listen(port, () => {
      logger.info(`Server running in ${env.NODE_ENV} mode on port ${port}`);
      logger.info(`API URL: ${env.API_URL}`);
    });
    
    // Handle graceful shutdown
    setupGracefulShutdown(server);
    
    return server;
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

/**
 * Set up graceful shutdown handlers
 */
function setupGracefulShutdown(server: import('http').Server) {
  // Handle various termination signals
  const shutdownSignals = ['SIGINT', 'SIGTERM', 'SIGUSR2'];
  
  shutdownSignals.forEach(signal => {
    process.on(signal, async () => {
      logger.info(`${signal} received, shutting down gracefully...`);
      
      // Close HTTP server first (stop accepting new requests)
      server.close(() => {
        logger.info('HTTP server closed');
      });
      
      try {
        // Close database connections
        await db.close();
        
        // Close cache connections
        await cache.close();
        
        // Stop notification scheduler
        notificationScheduler.stop();
        
        // Stop daily brief scheduler
        dailyBriefScheduler.stop();
        
        logger.info('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error('Error during graceful shutdown:', error);
        process.exit(1);
      }
    });
  });
}

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}

export { startServer };