import env from './env.js';

const isDev = env.isDev;
const configuredClientUrl = env.clientUrl;

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. curl, server-to-server, postman)
    if (!origin) return callback(null, true);

    if (isDev) {
      // In development, allow any localhost or 127.0.0.1 port (e.g. 5173, 5174, 5175, 3000)
      if (
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
        origin === configuredClientUrl
      ) {
        return callback(null, true);
      }
    }

    if (origin === configuredClientUrl || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    return callback(new Error(`CORS request blocked: origin ${origin} is not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Business-ID',
    'x-business-id',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 hours
};

export default corsOptions;

