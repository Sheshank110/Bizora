import mongoose from 'mongoose';
import env from './env.js';
import logger from '../utils/logger.js';

const connectDB = async () => {
  if (!env.mongoUri) {
    logger.warn('MONGODB_URI is not set. Database features will be unavailable.');
    return null;
  }

  try {
    const conn = await mongoose.connect(env.mongoUri, {
      // Mongoose 8 uses sensible defaults; these are explicitly documented
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    return conn;
  } catch (error) {
    // In development, handle gracefully without crashing or alarming errors
    if (env.isDev) {
      logger.warn(`Local MongoDB not detected (${error.message}). Running with built-in in-memory DevMockDb.`);
      return null;
    }
    logger.error(`MongoDB connection failed: ${error.message}`);
    if (process.env.VERCEL) {
      return null;
    }
    process.exit(1);
  }
};

export default connectDB;
