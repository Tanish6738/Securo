import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import tempEmailRoutes from './routes/tempEmail.js';
import messagesRoutes from './routes/messages.js';
import debugRoutes from './routes/debug.js';
import { cleanupExpiredEmails } from './utils/cleanup.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.MAIL_SERVICE_PORT || 3001;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'MailService',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/temp-email', tempEmailRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/debug', debugRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
  });
});

// Start cleanup process
const CLEANUP_INTERVAL = (process.env.CLEANUP_INTERVAL_MINUTES || 30) * 60 * 1000;
setInterval(cleanupExpiredEmails, CLEANUP_INTERVAL);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MailService running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`🧹 Cleanup interval: ${CLEANUP_INTERVAL / 60000} minutes`);
  
  // Initial cleanup on startup
  cleanupExpiredEmails();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📴 SIGINT received, shutting down gracefully...');
  process.exit(0);
});