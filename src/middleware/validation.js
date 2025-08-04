export const validateTimeRange = (req, res, next) => {
  const { startTime, endTime } = req.query;

  if (!startTime || !endTime) {
    return res.status(400).json({
      error: 'Missing time parameters',
      message: 'Both startTime and endTime are required'
    });
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return res.status(400).json({
      error: 'Invalid date format',
      message: 'startTime and endTime must be valid ISO date strings'
    });
  }

  if (start >= end) {
    return res.status(400).json({
      error: 'Invalid time range',
      message: 'startTime must be before endTime'
    });
  }

  // Validar que el rango no sea mayor a 30 días
  const maxRange = 30 * 24 * 60 * 60 * 1000; // 30 días en ms
  if (end - start > maxRange) {
    return res.status(400).json({
      error: 'Time range too large',
      message: 'Maximum time range is 30 days'
    });
  }

  next();
};

export const validateId = (req, res, next) => {
  const { id } = req.params;

  if (!id || id.trim() === '') {
    return res.status(400).json({
      error: 'Missing ID parameter',
      message: 'Device ID is required'
    });
  }

  // Validar formato básico del ID (alfanumérico, guiones, puntos)
  const idRegex = /^[a-zA-Z0-9._-]+$/;
  if (!idRegex.test(id)) {
    return res.status(400).json({
      error: 'Invalid ID format',
      message: 'ID can only contain letters, numbers, dots, hyphens, and underscores'
    });
  }

  next();
};

export const validateLimit = (req, res, next) => {
  const { limit } = req.query;

  if (limit) {
    const limitNum = parseInt(limit, 10);
    
    // Aumentar límite máximo para recorridos completos
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 50000) {
      return res.status(400).json({
        error: 'Invalid limit parameter',
        message: 'Limit must be a number between 1 and 50000'
      });
    }

    req.query.limit = limitNum;
  }

  next();
};

export const validateSampling = (req, res, next) => {
  const { sampling } = req.query;

  if (sampling) {
    const samplingNum = parseInt(sampling, 10);
    
    if (isNaN(samplingNum) || samplingNum < 1 || samplingNum > 100) {
      return res.status(400).json({
        error: 'Invalid sampling parameter',
        message: 'Sampling must be a number between 1 and 100 (every N records)'
      });
    }

    req.query.sampling = samplingNum;
  }

  next();
};