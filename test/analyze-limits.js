import { BigQuery } from '@google-cloud/bigquery';
import dotenv from 'dotenv';

dotenv.config();

async function analyzeLimitsAndRoutes() {
  console.log('🔍 Analizando límites y estrategias para recorridos...\n');
  
  try {
    const bigquery = new BigQuery({
      projectId: process.env.GCP_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      location: process.env.BIGQUERY_LOCATION || 'US'
    });

    // 1. Analizar volumen de datos por usuario/dispositivo
    console.log('1️⃣ Analizando volumen de datos por día:');
    
    // GPS Analysis
    const gpsVolumeQuery = `
      SELECT 
        deviceId,
        DATE(timestamp) as date,
        COUNT(*) as records_per_day,
        MIN(timestamp) as first_record,
        MAX(timestamp) as last_record,
        TIMESTAMP_DIFF(MAX(timestamp), MIN(timestamp), MINUTE) as duration_minutes
      FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BIGQUERY_DATASET_ID}.${process.env.BIGQUERY_GPS_TABLE_ID}\`
      WHERE deviceId = 'device-001'
      GROUP BY deviceId, DATE(timestamp)
      ORDER BY date DESC
      LIMIT 7
    `;
    
    const [gpsVolumeJob] = await bigquery.createQueryJob({ query: gpsVolumeQuery, location: 'US' });
    const [gpsVolumeRows] = await gpsVolumeJob.getQueryResults();
    
    console.log('   📍 GPS (device-001) - Registros por día:');
    gpsVolumeRows.forEach(row => {
      console.log(`      ${row.date}: ${row.records_per_day} registros, duración: ${row.duration_minutes} min`);
    });

    // Mobile Analysis
    const mobileVolumeQuery = `
      SELECT 
        userId,
        DATE(timestamp) as date,
        COUNT(*) as records_per_day,
        MIN(timestamp) as first_record,
        MAX(timestamp) as last_record,
        TIMESTAMP_DIFF(MAX(timestamp), MIN(timestamp), MINUTE) as duration_minutes
      FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BIGQUERY_DATASET_ID}.${process.env.BIGQUERY_MOBILE_TABLE_ID}\`
      WHERE userId = 'BIIm73haRJWBOBzVZ7jRVJuWQp13'
      GROUP BY userId, DATE(timestamp)
      ORDER BY date DESC
      LIMIT 7
    `;
    
    const [mobileVolumeJob] = await bigquery.createQueryJob({ query: mobileVolumeQuery, location: 'US' });
    const [mobileVolumeRows] = await mobileVolumeJob.getQueryResults();
    
    console.log('\n   📱 Mobile (BIIm73haRJWBOBzVZ7jRVJuWQp13) - Registros por día:');
    mobileVolumeRows.forEach(row => {
      console.log(`      ${row.date}: ${row.records_per_day} registros, duración: ${row.duration_minutes} min`);
    });

    // 2. Simular consulta de recorrido completo de un día
    console.log('\n2️⃣ Simulando consulta de recorrido completo de un día:');
    
    const fullDayQuery = `
      SELECT 
        userId,
        lat,
        lng,
        timestamp,
        LAG(lat) OVER (ORDER BY timestamp) as prev_lat,
        LAG(lng) OVER (ORDER BY timestamp) as prev_lng,
        LAG(timestamp) OVER (ORDER BY timestamp) as prev_timestamp
      FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BIGQUERY_DATASET_ID}.${process.env.BIGQUERY_MOBILE_TABLE_ID}\`
      WHERE userId = 'BIIm73haRJWBOBzVZ7jRVJuWQp13'
        AND DATE(timestamp) = '2025-08-01'
      ORDER BY timestamp ASC
    `;
    
    const [fullDayJob] = await bigquery.createQueryJob({ query: fullDayQuery, location: 'US' });
    const [fullDayRows] = await fullDayJob.getQueryResults();
    
    console.log(`   📊 Recorrido completo del 2025-08-01: ${fullDayRows.length} puntos`);
    
    if (fullDayRows.length > 0) {
      console.log(`   🕐 Primer punto: ${fullDayRows[0].timestamp.value}`);
      console.log(`   🕐 Último punto: ${fullDayRows[fullDayRows.length - 1].timestamp.value}`);
      
      // Calcular distancias aproximadas
      let totalDistance = 0;
      fullDayRows.forEach((row, index) => {
        if (row.prev_lat && row.prev_lng) {
          const distance = calculateDistance(
            row.prev_lat, row.prev_lng,
            row.lat, row.lng
          );
          totalDistance += distance;
        }
      });
      
      console.log(`   📏 Distancia aproximada total: ${totalDistance.toFixed(2)} km`);
      console.log(`   ⏱️ Duración total: ${Math.round((new Date(fullDayRows[fullDayRows.length - 1].timestamp.value) - new Date(fullDayRows[0].timestamp.value)) / 1000 / 60)} minutos`);
    }

    // 3. Analizar costos de BigQuery
    console.log('\n3️⃣ Análisis de costos y rendimiento:');
    
    const costAnalysisQuery = `
      SELECT 
        COUNT(*) as total_records,
        COUNT(DISTINCT DATE(timestamp)) as total_days,
        AVG(daily_records) as avg_records_per_day,
        MAX(daily_records) as max_records_per_day
      FROM (
        SELECT 
          DATE(timestamp) as date,
          COUNT(*) as daily_records
        FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BIGQUERY_DATASET_ID}.${process.env.BIGQUERY_MOBILE_TABLE_ID}\`
        WHERE userId = 'BIIm73haRJWBOBzVZ7jRVJuWQp13'
        GROUP BY DATE(timestamp)
      )
    `;
    
    const [costJob] = await bigquery.createQueryJob({ query: costAnalysisQuery, location: 'US' });
    const [costRows] = await costJob.getQueryResults();
    
    const stats = costRows[0];
    console.log(`   📊 Total registros: ${stats.total_records}`);
    console.log(`   📅 Días con datos: ${stats.total_days}`);
    console.log(`   📈 Promedio registros/día: ${Math.round(stats.avg_records_per_day)}`);
    console.log(`   📈 Máximo registros/día: ${stats.max_records_per_day}`);
    
    // Estimación de costos BigQuery (aproximado)
    const bytesPerRecord = 50; // Estimación
    const totalBytes = stats.total_records * bytesPerRecord;
    const costPerTB = 5; // USD por TB procesado
    const estimatedCost = (totalBytes / (1024**4)) * costPerTB;
    
    console.log(`   💰 Costo estimado por consulta completa: $${estimatedCost.toFixed(6)} USD`);

    // 4. Estrategias recomendadas
    console.log('\n4️⃣ Estrategias recomendadas:');
    console.log('   ✅ Para recorridos diarios: Sin límite o límite alto (5000-10000)');
    console.log('   ✅ Para análisis exploratorio: Límite bajo (100-1000)');
    console.log('   ✅ Para tiempo real: Últimos N registros');
    console.log('   ✅ Para optimización: Paginación con OFFSET');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Función para calcular distancia aproximada entre dos puntos
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

analyzeLimitsAndRoutes().catch(console.error);