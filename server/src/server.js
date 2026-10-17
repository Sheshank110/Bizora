import http from 'http';
import env from './config/env.js';
import app from './app.js';
import connectDB from './config/db.js';
import logger from './utils/logger.js';
import { initSocket } from './services/socketService.js';

let httpServer = null;

export const startServer = async () => {
  // Attempt database connection
  await connectDB();

  // Create HTTP server
  httpServer = http.createServer(app);

  // Initialize Real-time Socket.IO
  initSocket(httpServer, env.clientUrl || 'http://localhost:5173');

  // Handle port conflicts gracefully
  httpServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      logger.error(`Port ${env.port} is already in use by another process.`);
      logger.error(`Please close conflicting apps or set a different PORT in .env (e.g. PORT=5001).`);
    } else {
      logger.error('HTTP Server error:', err.message);
    }
    process.exit(1);
  });

  // Start HTTP server
  const server = httpServer.listen(env.port, () => {
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info(`  Bizora API Server (with Socket.IO Realtime)`);
    logger.info(`  Port:        ${env.port}`);
    logger.info(`  Environment: ${env.nodeEnv}`);
    logger.info(`  Health:      http://localhost:${env.port}/api/health`);
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  return server;
};

// Auto-connect database in Vercel serverless environment
if (process.env.VERCEL) {
  connectDB().catch((err) => {
    logger.warn('Vercel serverless DB initialization:', err.message);
  });
}

// Start standalone server when executed directly (local development)
const isMainScript = process.argv[1] && (process.argv[1].endsWith('server.js') || process.argv[1].endsWith('server'));
if (!process.env.VERCEL && isMainScript) {
  startServer().catch((err) => {
    logger.error('Failed to start server:', err.message);
    process.exit(1);
  });
}

export default app;

