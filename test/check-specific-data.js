import { BigQuery } from '@google-cloud/bigquery';
import dotenv from 'dotenv';

dotenv.config();

async function checkSpecificData() {
  console.log('🔍 Verificando datos específicos...');
  
  try {
    const bigquery = new BigQuery({
      projectId: process.env.GCP_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      location: process.env.BIGQUERY_LOCATION || 'US'
    });

    // Verificar device-001 en GPS
    console.log('\n📍 Verificando device-001 en GPS:');
    const gpsQuery = `
      SELECT deviceId, lat, lng, timestamp
      FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BIGQUERY_DATASET_ID}.${process.env.BIGQUERY_GPS_TABLE_ID}\`
      WHERE deviceId = 'device-001'
      ORDER BY timestamp DESC
      LIMIT 5
    `;
    const [gpsJob] = await bigquery.createQueryJob({ query: gpsQuery, location: 'US' });
    const [gpsRows] = await gpsJob.getQueryResults();
    console.log(`✅ Encontrados ${gpsRows.length} registros para device-001:`);
    gpsRows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.deviceId} - Lat: ${row.lat}, Lng: ${row.lng}, Time: ${row.timestamp.value}`);
    });

    // Verificar BIIm73haRJWBOBzVZ7jRVJuWQp13 en Mobile
    console.log('\n📱 Verificando BIIm73haRJWBOBzVZ7jRVJuWQp13 en Mobile:');
    const mobileQuery = `
      SELECT userId, lat, lng, timestamp
      FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BIGQUERY_DATASET_ID}.${process.env.BIGQUERY_MOBILE_TABLE_ID}\`
      WHERE userId = 'BIIm73haRJWBOBzVZ7jRVJuWQp13'
      ORDER BY timestamp DESC
      LIMIT 5
    `;
    const [mobileJob] = await bigquery.createQueryJob({ query: mobileQuery, location: 'US' });
    const [mobileRows] = await mobileJob.getQueryResults();
    console.log(`✅ Encontrados ${mobileRows.length} registros para BIIm73haRJWBOBzVZ7jRVJuWQp13:`);
    mobileRows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.userId} - Lat: ${row.lat}, Lng: ${row.lng}, Time: ${row.timestamp.value}`);
    });

    // Mostrar algunos userIds disponibles si no se encuentra el específico
    if (mobileRows.length === 0) {
      console.log('\n📋 Algunos userIds disponibles en Mobile:');
      const availableUsersQuery = `
        SELECT DISTINCT userId
        FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BIGQUERY_DATASET_ID}.${process.env.BIGQUERY_MOBILE_TABLE_ID}\`
        LIMIT 10
      `;
      const [availableUsersJob] = await bigquery.createQueryJob({ query: availableUsersQuery, location: 'US' });
      const [availableUsersRows] = await availableUsersJob.getQueryResults();
      availableUsersRows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.userId}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkSpecificData().catch(console.error);