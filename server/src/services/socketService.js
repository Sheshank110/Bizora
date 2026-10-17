import { Server } from 'socket.io';
import logger from '../utils/logger.js';

let io = null;

export const initSocket = (httpServer, clientOrigin = 'http://localhost:5173') => {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (process.env.NODE_ENV !== 'production') {
          if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
            return callback(null, true);
          }
        }
        if (origin === clientOrigin || origin.endsWith('.vercel.app')) {
          return callback(null, true);
        }
        return callback(null, false);
      },
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    logger.info(`[Socket.IO] Client connected: ${socket.id}`);

    // Join authenticated business workspace room
    socket.on('joinBusiness', (businessId) => {
      if (businessId) {
        socket.join(`business_${businessId}`);
        logger.info(`[Socket.IO] Socket ${socket.id} joined business_${businessId}`);
      }
    });

    // Join personal user notification room
    socket.on('joinUser', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
        logger.info(`[Socket.IO] Socket ${socket.id} joined user_${userId}`);
      }
    });

    socket.on('disconnect', () => {
      logger.info(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => io;

export const emitToBusiness = (businessId, event, data) => {
  if (io && businessId) {
    io.to(`business_${businessId}`).emit(event, data);
  }
};

export const emitToUser = (userId, event, data) => {
  if (io && userId) {
    io.to(`user_${userId}`).emit(event, data);
  }
};
