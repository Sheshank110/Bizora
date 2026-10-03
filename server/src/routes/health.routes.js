import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

/**
 * GET /api/health
 * Health check endpoint — reports server and database status.
 */
router.get('/', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatuses = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.json({
    success: true,
    message: 'Bizora API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    database: dbStatuses[dbState] || 'unknown',
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

export default router;
