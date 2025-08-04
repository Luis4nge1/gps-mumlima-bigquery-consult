import { BigQuery } from '@google-cloud/bigquery';
import dotenv from 'dotenv';

dotenv.config();

async function testBigQuery() {
  console.log('🔍 Probando conexión a BigQuery...');
  
  try {
    const bigquery = new BigQuery({
      projectId: process.env.GCP_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      location: process.env.BIGQUERY_LOCATION || 'US'
    });

    console.log('📊 Configuración:');
    console.log(`   Project ID: ${process.env.GCP_PROJECT_ID}`);
    console.log(`   Dataset ID: ${process.env.BIGQUERY_DATASET_ID}`);
    console.log(`   GPS Table: ${process.env.BIGQUERY_GPS_TABLE_ID}`);
    console.log(`   Mobile Table: ${process.env.BIGQUERY_MOBILE_TABLE_ID}`);
    console.log(`   Credentials: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);

    // Test 1: Conexión básica
    console.log('\n1️⃣ Probando conexión básica...');
    const [job] = await bigquery.createQueryJob({
      query: 'SELECT 1 as test',
      location: 'US'
    });
    const [rows] = await job.getQueryResults();
    console.log('✅ Conexión básica exitosa:', rows);

    // Test 2: Verificar que existen las tablas
    console.log('\n2️⃣ Verificando tablas...');
    const dataset = bigquery.dataset(process.env.BIGQUERY_DATASET_ID);
    
    // Verificar tabla GPS
    try {
      const gpsTable = dataset.table(process.env.BIGQUERY_GPS_TABLE_ID);
      const [gpsExists] = await gpsTable.exists();
      console.log(`📍 Tabla GPS (${process.env.BIGQUERY_GPS_TABLE_ID}): ${gpsExists ? '✅ Existe' : '❌ No existe'}`);
      
      if (gpsExists) {
        // Contar registros GPS
        const gpsCountQuery = `
          SELECT COUNT(*) as total 
          FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BIGQUERY_DATASET_ID}.${process.env.BIGQUERY_GPS_TABLE_ID}\`
        `;
        const [gpsCountJob] = await bigquery.createQueryJob({ query: gpsCountQuery, location: 'US' });
        const [gpsCountRows] = await gpsCountJob.getQueryResults();
        console.log(`   Total registros GPS: ${gpsCountRows[0].total}`);
        
        // Buscar device-001
        const gpsDeviceQuery = `
          SELECT COUNT(*) as total 
          FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BIGQUERY_DATASET_ID}.${process.env.BIGQUERY_GPS_TABLE_ID}\`
          WHERE id = 'device-001'
        `;
        const [gpsDeviceJob] = await bigquery.createQueryJob({ query: gpsDeviceQuery, location: 'US' });
        const [gpsDeviceRows] = await gpsDeviceJob.getQueryResults();
        console.log(`   Registros para device-001: ${gpsDeviceRows[0].total}`);
      }
    } catch (error) {
      console.log(`❌ Error verificando tabla GPS: ${error.message}`);
    }

    // Verificar tabla Mobile
    try {
      const mobileTable = dataset.table(process.env.BIGQUERY_MOBILE_TABLE_ID);
      const [mobileExists] = await mobileTable.exists();
      console.log(`📱 Tabla Mobile (${process.env.BIGQUERY_MOBILE_TABLE_ID}): ${mobileExists ? '✅ Existe' : '❌ No existe'}`);
      
      if (mobileExists) {
        // Contar registros Mobile
        const mobileCountQuery = `
          SELECT COUNT(*) as total 
          FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BIGQUERY_DATASET_ID}.${process.env.BIGQUERY_MOBILE_TABLE_ID}\`
        `;
        const [mobileCountJob] = await bigquery.createQueryJob({ query: mobileCountQuery, location: 'US' });
        const [mobileCountRows] = await mobileCountJob.getQueryResults();
        console.log(`   Total registros Mobile: ${mobileCountRows[0].total}`);
        
        // Buscar BIIm73haRJWBOBzVZ7jRVJuWQp13
        const mobileUserQuery = `
          SELECT COUNT(*) as total 
          FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BIGQUERY_DATASET_ID}.${process.env.BIGQUERY_MOBILE_TABLE_ID}\`
          WHERE id = 'BIIm73haRJWBOBzVZ7jRVJuWQp13'
        `;
        const [mobileUserJob] = await bigquery.createQueryJob({ query: mobileUserQuery, location: 'US' });
        const [mobileUserRows] = await mobileUserJob.getQueryResults();
        console.log(`   Registros para BIIm73haRJWBOBzVZ7jRVJuWQp13: ${mobileUserRows[0].total}`);
      }
    } catch (error) {
      console.log(`❌ Error verificando tabla Mobile: ${error.message}`);
    }

    // Test 3: Probar consulta real GPS
    console.log('\n3️⃣ Probando consulta GPS real...');
    try {
      const gpsQuery = `
        SELECT id, lat, lng, timestamp
        FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BIGQUERY_DATASET_ID}.${process.env.BIGQUERY_GPS_TABLE_ID}\`
        WHERE id = 'device-001'
        ORDER BY timestamp DESC
        LIMIT 1
      `;
      const [gpsJob] = await bigquery.createQueryJob({ query: gpsQuery, location: 'US' });
      const [gpsRows] = await gpsJob.getQueryResults();
      console.log('✅ Consulta GPS exitosa:', gpsRows);
    } catch (error) {
      console.log(`❌ Error en consulta GPS: ${error.message}`);
    }

    // Test 4: Probar consulta real Mobile
    console.log('\n4️⃣ Probando consulta Mobile real...');
    try {
      const mobileQuery = `
        SELECT id, lat, lng, timestamp
        FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BIGQUERY_DATASET_ID}.${process.env.BIGQUERY_MOBILE_TABLE_ID}\`
        WHERE id = 'BIIm73haRJWBOBzVZ7jRVJuWQp13'
        ORDER BY timestamp DESC
        LIMIT 1
      `;
      const [mobileJob] = await bigquery.createQueryJob({ query: mobileQuery, location: 'US' });
      const [mobileRows] = await mobileJob.getQueryResults();
      console.log('✅ Consulta Mobile exitosa:', mobileRows);
    } catch (error) {
      console.log(`❌ Error en consulta Mobile: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
    console.error('Stack:', error.stack);
  }
}

testBigQuery().catch(console.error);