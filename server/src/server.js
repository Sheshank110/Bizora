import env from './config/env.js';
import app from './app.js';
import connectDB from './config/db.js';
import logger from './utils/logger.js';

const startServer = async () => {
  // Attempt database connection
  await connectDB();

  // Start HTTP server
  const server = app.listen(env.port, () => {
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info(`  Bizora API Server`);
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
};

startServer().catch((err) => {
  logger.error('Failed to start server:', err.message);
  process.exit(1);
});
