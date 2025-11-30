import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import {
  requestLogger,
  errorHandler,
  notFoundHandler,
  standardLimiter,
  logger,
} from './middleware';
import ipRoutes from './routes/ip';
import dnsRoutes from './routes/dns';
import webrtcRoutes from './routes/webrtc';
import privacyScoreRoutes from './routes/privacy-score';
import networkRoutes from './routes/network';
import eventsRoutes from './routes/events';
import fingerprintRoutes from './routes/fingerprint';
import historyRoutes from './routes/history';
import shareRoutes from './routes/share';

const app = express();

// Trust proxy for correct IP detection behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.ipify.org', 'https://ipinfo.io'],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS - allow multiple origins in development
const allowedOrigins = config.NODE_ENV === 'production'
  ? ['https://browserleaks.io', 'https://www.browserleaks.io']
  : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-API-Key'],
    exposedHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  })
);

// Request logging (add request ID and log all requests)
app.use(requestLogger);

// Rate limiting
app.use('/v1', standardLimiter);

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: config.NODE_ENV,
  });
});

// API routes
app.use('/v1', ipRoutes);
app.use('/v1', dnsRoutes);
app.use('/v1', webrtcRoutes);
app.use('/v1', privacyScoreRoutes);
app.use('/v1', networkRoutes);
app.use('/v1', eventsRoutes);
app.use('/v1/fingerprint', fingerprintRoutes);
app.use('/v1/history', historyRoutes);
app.use('/v1/share', shareRoutes);

// API info
app.get('/v1', (req, res) => {
  res.json({
    name: 'BrowserLeaks API',
    version: '1.0.0',
    endpoints: [
      'POST /v1/detect/ip',
      'GET /v1/detect/ip/:ip',
      'POST /v1/detect/dns-leak',
      'POST /v1/detect/webrtc-leak',
      'POST /v1/fingerprint',
      'POST /v1/fingerprint/scan',
      'GET /v1/fingerprint/:hash',
      'POST /v1/privacy-score',
      'GET /v1/history',
      'POST /v1/history',
      'POST /v1/history/compare',
      'GET /v1/history/:scanId',
      'DELETE /v1/history/:scanId',
      'POST /v1/share',
      'GET /v1/share/:code',
      'DELETE /v1/share/:code',
      'GET /v1/share/:code/stats',
    ],
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Log startup info
logger.info('Express app initialized', {
  env: config.NODE_ENV,
  corsOrigins: allowedOrigins,
});

export default app;
