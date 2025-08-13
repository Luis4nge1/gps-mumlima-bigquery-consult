import express from 'express';
import queryService from '../services/queryService.js';
import { validateId, validateTimeRange, validateLimit, validateSampling } from '../middleware/validation.js';

const router = express.Router();

/**
 * GET /api/mobile/:id
 * Obtiene datos Mobile por ID con filtro de tiempo
 */
router.get('/:id', validateId, validateTimeRange, validateLimit, validateSampling, async (req, res) => {
  try {
    const { id } = req.params;
    const { startTime, endTime, limit = 20000, sampling } = req.query;

    const data = await queryService.getMobileData(id, startTime, endTime, limit, sampling);

    res.json({
      success: true,
      data,
      count: data.length,
      query: {
        id,
        startTime,
        endTime,
        limit,
        sampling
      }
    });
  } catch (error) {
    console.error('Mobile query error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/mobile/:id/route/:date
 * Obtiene el recorrido completo de un usuario móvil para una fecha específica
 */
router.get('/:id/route/:date', validateId, validateLimit, validateSampling, async (req, res) => {
  try {
    const { id, date } = req.params;
    const { limit = 50000, sampling } = req.query;

    // Validar formato de fecha (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        error: 'Invalid date format',
        message: 'Date must be in YYYY-MM-DD format'
      });
    }

    const data = await queryService.getMobileRoute(id, date, limit, sampling);

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: `No mobile route found for user ID: ${id} on date: ${date}`
      });
    }

    // Calcular metadatos del recorrido
    const metadata = calculateRouteMetadata(data);

    res.json({
      success: true,
      data,
      count: data.length,
      metadata,
      query: {
        id,
        date,
        limit,
        sampling
      }
    });
  } catch (error) {
    console.error('Mobile route query error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Función helper para calcular metadatos del recorrido (reutilizada de GPS)
function calculateRouteMetadata(data) {
  if (!data || data.length === 0) return null;

  const firstPoint = data[0];
  const lastPoint = data[data.length - 1];
  
  let totalDistance = 0;
  for (let i = 1; i < data.length; i++) {
    const prev = data[i - 1];
    const curr = data[i];
    totalDistance += calculateDistance(prev.lat, prev.lng, curr.lat, curr.lng);
  }

  const startTime = new Date(firstPoint.timestamp);
  const endTime = new Date(lastPoint.timestamp);
  const durationMinutes = Math.round((endTime - startTime) / 20 / 60);

  return {
    totalPoints: data.length,
    totalDistance: Math.round(totalDistance * 100) / 100,
    duration: {
      minutes: durationMinutes,
      hours: Math.round(durationMinutes / 60 * 100) / 100
    },
    timeRange: {
      start: firstPoint.timestamp,
      end: lastPoint.timestamp
    },
    bounds: {
      north: Math.max(...data.map(p => p.lat)),
      south: Math.min(...data.map(p => p.lat)),
      east: Math.max(...data.map(p => p.lng)),
      west: Math.min(...data.map(p => p.lng))
    }
  };
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * GET /api/mobile/:id/latest
 * Obtiene el último registro Mobile de un dispositivo
 */
router.get('/:id/latest', validateId, async (req, res) => {
  try {
    const { id } = req.params;

    const data = await queryService.getLatestMobileData(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: `No Mobile data found for device ID: ${id}`
      });
    }

    res.json({
      success: true,
      data,
      query: { id }
    });
  } catch (error) {
    console.error('Mobile latest query error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

export default router;