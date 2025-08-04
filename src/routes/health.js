import express from 'express';
import bigquery from '../config/bigquery.js';

const router = express.Router();

/**
 * GET /health
 * Health check endpoint
 */
router.get('/', async (req, res) => {
  try {
    // Test BigQuery connection
    await bigquery.query('SELECT 1 as test');
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        bigquery: 'connected'
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        bigquery: 'disconnected'
      },
      error: error.message
    });
  }
});

export default router;