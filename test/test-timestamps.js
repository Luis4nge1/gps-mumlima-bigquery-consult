import { BigQuery } from '@google-cloud/bigquery';
import dotenv from 'dotenv';

dotenv.config();

async function testTimestamps() {
  console.log('🕐 Investigando manejo de timestamps en BigQuery...\n');
  
  try {
    const bigquery = new BigQuery({
      projectId: process.env.GCP_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      location: process.env.BIGQUERY_LOCATION || 'US'
    });

    // 1. Verificar algunos timestamps reales en la base de datos
    console.log('1️⃣ Verificando timestamps reales en GPS:');
    const gpsQuery = `
      SELECT deviceId, timestamp,
             FORMAT_TIMESTAMP('%Y-%m-%d %H:%M:%S UTC', timestamp) as formatted_timestamp
      FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BIGQUERY_DATASET_ID}.${process.env.BIGQUERY_GPS_TABLE_ID}\`
      WHERE deviceId = 'device-001'
      ORDER BY timestamp DESC
      LIMIT 5
    `;
    
    const [gpsJob] = await bigquery.createQueryJob({ query: gpsQuery, location: 'US' });
    const [gpsRows] = await gpsJob.getQueryResults();
    
    gpsRows.forEach((row, index) => {
      console.log(`   ${index + 1}. Raw: ${row.timestamp.value}`);
      console.log(`      Formatted: ${row.formatted_timestamp}`);
      console.log('');
    });

    // 2. Probar diferentes formatos de fecha en consultas
    console.log('2️⃣ Probando diferentes formatos de fecha:');
    
    const testDates = [
      // ISO 8601 UTC
      '2025-07-31T22:00:00.000Z',
      '2025-07-31T22:00:00Z',
      
      // ISO 8601 con timezone
      '2025-07-31T17:00:00-05:00', // Lima timezone (UTC-5)
      
      // Formato sin timezone (BigQuery lo interpreta como UTC)
      '2025-07-31 22:00:00',
      '2025-07-31T22:00:00'
    ];

    for (const testDate of testDates) {
      try {
        console.log(`\n   Probando formato: "${testDate}"`);
        
        const testQuery = `
          SELECT COUNT(*) as count,
                 MIN(timestamp) as min_time,
                 MAX(timestamp) as max_time
          FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BIGQUERY_DATASET_ID}.${process.env.BIGQUERY_GPS_TABLE_ID}\`
          WHERE deviceId = 'device-001'
            AND timestamp >= @testDate
        `;
        
        const [testJob] = await bigquery.createQueryJob({ 
          query: testQuery, 
          location: 'US',
          params: { testDate }
        });
        const [testRows] = await testJob.getQueryResults();
        
        const result = testRows[0];
        console.log(`   ✅ Éxito: ${result.count} registros encontrados`);
        if (result.min_time) {
          console.log(`      Rango: ${result.min_time.value} a ${result.max_time.value}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }

    // 3. Probar consulta con rango de tiempo específico
    console.log('\n3️⃣ Probando consulta con rango de tiempo:');
    
    // Usar las fechas en diferentes formatos
    const startTimeUTC = '2025-07-31T22:00:00.000Z';
    const endTimeUTC = '2025-08-01T00:00:00.000Z';
    
    const startTimeLima = '2025-07-31T17:00:00-05:00'; // Equivalente en Lima
    const endTimeLima = '2025-07-31T19:00:00-05:00';   // Equivalente en Lima
    
    console.log(`\n   Consulta UTC: ${startTimeUTC} a ${endTimeUTC}`);
    const utcQuery = `
      SELECT deviceId, timestamp
      FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BIGQUERY_DATASET_ID}.${process.env.BIGQUERY_GPS_TABLE_ID}\`
      WHERE deviceId = 'device-001'
        AND timestamp >= @startTime
        AND timestamp <= @endTime
      ORDER BY timestamp DESC
      LIMIT 3
    `;
    
    const [utcJob] = await bigquery.createQueryJob({ 
      query: utcQuery, 
      location: 'US',
      params: { startTime: startTimeUTC, endTime: endTimeUTC }
    });
    const [utcRows] = await utcJob.getQueryResults();
    
    console.log(`   Resultados UTC: ${utcRows.length} registros`);
    utcRows.forEach((row, index) => {
      console.log(`      ${index + 1}. ${row.timestamp.value}`);
    });

    console.log(`\n   Consulta Lima timezone: ${startTimeLima} a ${endTimeLima}`);
    const [limaJob] = await bigquery.createQueryJob({ 
      query: utcQuery, 
      location: 'US',
      params: { startTime: startTimeLima, endTime: endTimeLima }
    });
    const [limaRows] = await limaJob.getQueryResults();
    
    console.log(`   Resultados Lima: ${limaRows.length} registros`);
    limaRows.forEach((row, index) => {
      console.log(`      ${index + 1}. ${row.timestamp.value}`);
    });

    // 4. Verificar timezone de BigQuery
    console.log('\n4️⃣ Verificando configuración de timezone:');
    const timezoneQuery = `
      SELECT 
        CURRENT_TIMESTAMP() as current_utc,
        DATETIME(CURRENT_TIMESTAMP(), "America/Lima") as current_lima
    `;
    
    const [tzJob] = await bigquery.createQueryJob({ query: timezoneQuery, location: 'US' });
    const [tzRows] = await tzJob.getQueryResults();
    
    const tzResult = tzRows[0];
    console.log(`   UTC actual: ${tzResult.current_utc.value}`);
    console.log(`   Lima actual: ${tzResult.current_lima}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testTimestamps().catch(console.error);