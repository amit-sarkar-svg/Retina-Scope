import express, { Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { ENV } from './config/env';
import { HTTP_STATUS } from './config/constants';
import { errorHandler } from './middleware/error.middleware';
import { notFoundHandler } from './middleware/not-found.middleware';

// Routes
import authRoutes from './routes/auth.routes';
import patientRoutes from './routes/patient.routes';
import screeningRoutes from './routes/screening.routes';
import resultRoutes from './routes/result.routes';
import queueRoutes from './routes/queue.routes';
import reviewRoutes from './routes/review.routes';
import reportRoutes from './routes/report.routes';

const app: Express = express();

// Enable CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      // Check allowed origin
      if (origin === ENV.FRONTEND_URL || origin === 'http://localhost:3000' || origin === 'http://127.0.0.1:3000') {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev, or customizable
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  })
);

// Logging middleware
if (ENV.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Request Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file hosting for uploads (useful for frontend to render uploaded fundus scans)
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

// Health Check Endpoint
app.get('/api/health', (_req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    service: 'RETINASCOPE API',
    status: 'ok',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/screenings', screeningRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/reports', reportRoutes);

// 404 Route Handler
app.use(notFoundHandler);

// Centralized Error Handler
app.use(errorHandler);

export default app;
