import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import corsOptions from './config/cors.js';
import env from './config/env.js';
import routes from './routes/index.js';
import notFound from './middlewares/notFound.js';
import errorHandler from './middlewares/errorHandler.js';
import connectDB from './config/db.js';

const app = express();

// Auto-connect database in Vercel serverless environment
if (process.env.VERCEL) {
  connectDB().catch((err) => {
    console.warn('[Vercel DB Init]', err.message);
  });
}

// Ensure DB is connected for serverless invocations
app.use(async (req, res, next) => {
  if (process.env.VERCEL) {
    try {
      await connectDB();
    } catch (err) {
      console.warn('[Vercel DB Hook]', err.message);
    }
  }
  next();
});

// ─── Security ────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(cors(corsOptions));

// ─── Parsing ─────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Request Logging ─────────────────────────────────
if (env.isDev) {
  app.use(morgan('dev'));
}

// ─── API Routes ──────────────────────────────────────
app.use('/api', routes);

// ─── Error Handling ──────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
