import bigquery, { config } from '../config/bigquery.js';

class QueryService {
  constructor() {
    this.dataset = bigquery.dataset(config.datasetId);
  }

  /**
   * Consulta datos GPS por ID con filtro de tiempo
   * @param {string} id - ID del dispositivo GPS
   * @param {string} startTime - Fecha de inicio (ISO string)
   * @param {string} endTime - Fecha de fin (ISO string)
   * @param {number} limit - Límite de resultados (opcional)
   * @returns {Promise<Array>} Array de registros GPS
   */
  async getGpsData(id, startTime, endTime, limit = 20000, sampling = null) {
    let query;
    let params = { id, startTime, endTime, limit };

    if (sampling) {
      // Consulta con muestreo optimizado
      query = `
        WITH numbered_points AS (
          SELECT 
            deviceId,
            lat,
            lng,
            timestamp,
            ROW_NUMBER() OVER (ORDER BY timestamp ASC) as row_num
          FROM \`${config.projectId}.${config.datasetId}.${config.gpsTableId}\`
          WHERE deviceId = @id
            AND timestamp >= @startTime
            AND timestamp <= @endTime
        )
        SELECT deviceId, lat, lng, timestamp
        FROM numbered_points
        WHERE MOD(row_num - 1, @sampling) = 0
        ORDER BY timestamp ASC
        LIMIT @limit
      `;
      params.sampling = sampling;
    } else {
      // Consulta normal
      query = `
        SELECT 
          deviceId,
          lat,
          lng,
          timestamp
        FROM \`${config.projectId}.${config.datasetId}.${config.gpsTableId}\`
        WHERE deviceId = @id
          AND timestamp >= @startTime
          AND timestamp <= @endTime
        ORDER BY timestamp ASC
        LIMIT @limit
      `;
    }

    const options = { query, params };

    try {
      const [rows] = await bigquery.query(options);
      return rows.map(row => ({
        id: row.deviceId,
        lat: parseFloat(row.lat),
        lng: parseFloat(row.lng),
        timestamp: row.timestamp.value || row.timestamp
      }));
    } catch (error) {
      console.error('Error querying GPS data:', error);
      throw new Error(`Failed to query GPS data: ${error.message}`);
    }
  }

  /**
   * Obtiene el recorrido completo de un dispositivo GPS para una fecha específica
   * @param {string} id - ID del dispositivo GPS
   * @param {string} date - Fecha en formato YYYY-MM-DD
   * @param {number} limit - Límite de resultados (opcional)
   * @param {number} sampling - Muestreo cada N registros (opcional)
   * @returns {Promise<Array>} Array de registros GPS ordenados cronológicamente
   */
  async getGpsRoute(id, date, limit = 50000, sampling = null) {
    let query;
    let params = { id, date, limit };

    if (sampling) {
      // Consulta con muestreo para recorridos optimizados
      query = `
        WITH numbered_points AS (
          SELECT 
            deviceId,
            lat,
            lng,
            timestamp,
            ROW_NUMBER() OVER (ORDER BY timestamp ASC) as row_num
          FROM \`${config.projectId}.${config.datasetId}.${config.gpsTableId}\`
          WHERE deviceId = @id
            AND DATE(timestamp) = @date
        )
        SELECT deviceId, lat, lng, timestamp
        FROM numbered_points
        WHERE MOD(row_num - 1, @sampling) = 0
        ORDER BY timestamp ASC
        LIMIT @limit
      `;
      params.sampling = sampling;
    } else {
      // Consulta completa del recorrido
      query = `
        SELECT 
          deviceId,
          lat,
          lng,
          timestamp
        FROM \`${config.projectId}.${config.datasetId}.${config.gpsTableId}\`
        WHERE deviceId = @id
          AND DATE(timestamp) = @date
        ORDER BY timestamp ASC
        LIMIT @limit
      `;
    }

    const options = { query, params };

    try {
      const [rows] = await bigquery.query(options);
      return rows.map(row => ({
        id: row.deviceId,
        lat: parseFloat(row.lat),
        lng: parseFloat(row.lng),
        timestamp: row.timestamp.value || row.timestamp
      }));
    } catch (error) {
      console.error('Error querying GPS route:', error);
      throw new Error(`Failed to query GPS route: ${error.message}`);
    }
  }

  /**
   * Consulta datos Mobile por ID con filtro de tiempo
   * @param {string} id - ID del dispositivo móvil
   * @param {string} startTime - Fecha de inicio (ISO string)
   * @param {string} endTime - Fecha de fin (ISO string)
   * @param {number} limit - Límite de resultados (opcional)
   * @returns {Promise<Array>} Array de registros Mobile
   */
  async getMobileData(id, startTime, endTime, limit = 20000, sampling = null) {
    let query;
    let params = { id, startTime, endTime, limit };

    if (sampling) {
      query = `
        WITH numbered_points AS (
          SELECT 
            userId,
            lat,
            lng,
            timestamp,
            ROW_NUMBER() OVER (ORDER BY timestamp ASC) as row_num
          FROM \`${config.projectId}.${config.datasetId}.${config.mobileTableId}\`
          WHERE userId = @id
            AND timestamp >= @startTime
            AND timestamp <= @endTime
        )
        SELECT userId, lat, lng, timestamp
        FROM numbered_points
        WHERE MOD(row_num - 1, @sampling) = 0
        ORDER BY timestamp ASC
        LIMIT @limit
      `;
      params.sampling = sampling;
    } else {
      query = `
        SELECT 
          userId,
          lat,
          lng,
          timestamp
        FROM \`${config.projectId}.${config.datasetId}.${config.mobileTableId}\`
        WHERE userId = @id
          AND timestamp >= @startTime
          AND timestamp <= @endTime
        ORDER BY timestamp ASC
        LIMIT @limit
      `;
    }

    const options = { query, params };

    try {
      const [rows] = await bigquery.query(options);
      return rows.map(row => ({
        id: row.userId,
        lat: parseFloat(row.lat),
        lng: parseFloat(row.lng),
        timestamp: row.timestamp.value || row.timestamp
      }));
    } catch (error) {
      console.error('Error querying Mobile data:', error);
      throw new Error(`Failed to query Mobile data: ${error.message}`);
    }
  }

  /**
   * Obtiene el recorrido completo de un usuario móvil para una fecha específica
   * @param {string} id - ID del usuario móvil
   * @param {string} date - Fecha en formato YYYY-MM-DD
   * @param {number} limit - Límite de resultados (opcional)
   * @param {number} sampling - Muestreo cada N registros (opcional)
   * @returns {Promise<Array>} Array de registros Mobile ordenados cronológicamente
   */
  async getMobileRoute(id, date, limit = 50000, sampling = null) {
    let query;
    let params = { id, date, limit };

    if (sampling) {
      query = `
        WITH numbered_points AS (
          SELECT 
            userId,
            lat,
            lng,
            timestamp,
            ROW_NUMBER() OVER (ORDER BY timestamp ASC) as row_num
          FROM \`${config.projectId}.${config.datasetId}.${config.mobileTableId}\`
          WHERE userId = @id
            AND DATE(timestamp) = @date
        )
        SELECT userId, lat, lng, timestamp
        FROM numbered_points
        WHERE MOD(row_num - 1, @sampling) = 0
        ORDER BY timestamp ASC
        LIMIT @limit
      `;
      params.sampling = sampling;
    } else {
      query = `
        SELECT 
          userId,
          lat,
          lng,
          timestamp
        FROM \`${config.projectId}.${config.datasetId}.${config.mobileTableId}\`
        WHERE userId = @id
          AND DATE(timestamp) = @date
        ORDER BY timestamp ASC
        LIMIT @limit
      `;
    }

    const options = { query, params };

    try {
      const [rows] = await bigquery.query(options);
      return rows.map(row => ({
        id: row.userId,
        lat: parseFloat(row.lat),
        lng: parseFloat(row.lng),
        timestamp: row.timestamp.value || row.timestamp
      }));
    } catch (error) {
      console.error('Error querying Mobile route:', error);
      throw new Error(`Failed to query Mobile route: ${error.message}`);
    }
  }

  /**
   * Obtiene el último registro de un dispositivo GPS
   * @param {string} id - ID del dispositivo GPS
   * @returns {Promise<Object|null>} Último registro GPS o null
   */
  async getLatestGpsData(id) {
    const query = `
      SELECT 
        deviceId,
        lat,
        lng,
        timestamp
      FROM \`${config.projectId}.${config.datasetId}.${config.gpsTableId}\`
      WHERE deviceId = @id
      ORDER BY timestamp ASC
      LIMIT 1
    `;

    const options = {
      query,
      params: { id }
    };

    try {
      const [rows] = await bigquery.query(options);
      if (rows.length === 0) return null;
      
      const row = rows[0];
      return {
        id: row.deviceId,
        lat: parseFloat(row.lat),
        lng: parseFloat(row.lng),
        timestamp: row.timestamp.value || row.timestamp
      };
    } catch (error) {
      console.error('Error querying latest GPS data:', error);
      throw new Error(`Failed to query latest GPS data: ${error.message}`);
    }
  }

  /**
   * Obtiene el último registro de un dispositivo móvil
   * @param {string} id - ID del dispositivo móvil
   * @returns {Promise<Object|null>} Último registro móvil o null
   */
  async getLatestMobileData(id) {
    const query = `
      SELECT 
        userId,
        lat,
        lng,
        timestamp
      FROM \`${config.projectId}.${config.datasetId}.${config.mobileTableId}\`
      WHERE userId = @id
      ORDER BY timestamp ASC
      LIMIT 1
    `;

    const options = {
      query,
      params: { id }
    };

    try {
      const [rows] = await bigquery.query(options);
      if (rows.length === 0) return null;
      
      const row = rows[0];
      return {
        id: row.userId,
        lat: parseFloat(row.lat),
        lng: parseFloat(row.lng),
        timestamp: row.timestamp.value || row.timestamp
      };
    } catch (error) {
      console.error('Error querying latest Mobile data:', error);
      throw new Error(`Failed to query latest Mobile data: ${error.message}`);
    }
  }
}

export default new QueryService();