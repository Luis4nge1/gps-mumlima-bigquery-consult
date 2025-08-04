import dotenv from 'dotenv';

dotenv.config();

export const authenticateApiKey = (req, res, next) => {
  const apiKey = process.env.API_KEY;
  
  // Si no hay API_KEY configurada, permitir acceso (desarrollo)
  if (!apiKey) {
    return next();
  }

  const providedKey = req.headers['x-api-key'] || req.query.api_key;

  if (!providedKey) {
    return res.status(401).json({
      error: 'API key required',
      message: 'Please provide an API key in the x-api-key header or api_key query parameter'
    });
  }

  if (providedKey !== apiKey) {
    return res.status(403).json({
      error: 'Invalid API key',
      message: 'The provided API key is not valid'
    });
  }

  next();
};