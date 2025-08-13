import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import routes
import gpsRoutes from './routes/gps.js';
import mobileRoutes from './routes/mobile.js';
import healthRoutes from './routes/health.js';

// Import middleware
import { authenticateApiKey } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;
const HOST = process.env.HOST || '0.0.0.0';

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.'
  }
});

app.use(limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check (no auth required)
app.use('/api/v5/health', healthRoutes);

// API authentication middleware
app.use('/api/v5', authenticateApiKey);

// API routes
app.use('/api/v5/gps', gpsRoutes);
app.use('/api/v5/mobile', mobileRoutes);

// Root endpoint
app.get('/api/v5', (req, res) => {
  res.json({
    name: 'GPS Query API',
    version: '1.0.0',
    description: 'API para consultas de datos GPS y Mobile desde BigQuery',
    endpoints: {
      health: '/api/v5health',
      gps: {
        byTimeRange: '/api/v5/gps/:id?startTime=YYYY-MM-DDTHH:mm:ss.sssZ&endTime=YYYY-MM-DDTHH:mm:ss.sssZ&limit=1000',
        latest: '/api/v5/gps/:id/latest'
      },
      mobile: {
        byTimeRange: '/api/v5/mobile/:id?startTime=YYYY-MM-DDTHH:mm:ss.sssZ&endTime=YYYY-MM-DDTHH:mm:ss.sssZ&limit=1000',
        byTimeRangePeru: '/api/v5/mobile/:id/peru-time?peruStartTime=YYYY-MM-DD HH:mm:ss&peruEndTime=YYYY-MM-DD HH:mm:ss&limit=1000',
        byDatePeru: '/api/v5/mobile/:id/peru-day/YYYY-MM-DD?limit=50000',
        latest: '/api/v5/mobile/:id/latest'
      }
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested endpoint does not exist'
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, HOST, () => {
  console.log(`🚀 GPS Query API running on http://${HOST}:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 API Key required: ${process.env.API_KEY ? 'Yes' : 'No'}`);
});

export default app;