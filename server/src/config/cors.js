import env from './env.js';

const corsOptions = {
  origin: env.isDev
    ? true // Allow all origins in development
    : [env.clientUrl],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
};

export default corsOptions;
