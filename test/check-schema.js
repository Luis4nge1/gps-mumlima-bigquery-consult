import { BigQuery } from '@google-cloud/bigquery';
import dotenv from 'dotenv';

dotenv.config();

async function checkSchema() {
  console.log('🔍 Verificando esquema de las tablas...');
  
  try {
    const bigquery = new BigQuery({
      projectId: process.env.GCP_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      location: process.env.BIGQUERY_LOCATION || 'US'
    });

    const dataset = bigquery.dataset(process.env.BIGQUERY_DATASET_ID);

    // Verificar esquema tabla GPS
    console.log('\n📍 Esquema tabla GPS:');
    try {
      const gpsTable = dataset.table(process.env.BIGQUERY_GPS_TABLE_ID);
      const [metadata] = await gpsTable.getMetadata();
      console.log('Campos disponibles:');
      metadata.schema.fields.forEach(field => {
        console.log(`   - ${field.name} (${field.type})`);
      });

      // Obtener algunos registros de ejemplo
      console.log('\n📊 Registros de ejemplo GPS:');
      const gpsQuery = `
        SELECT *
        FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BIGQUERY_DATASET_ID}.${process.env.BIGQUERY_GPS_TABLE_ID}\`
        LIMIT 3
      `;
      const [gpsJob] = await bigquery.createQueryJob({ query: gpsQuery, location: 'US' });
      const [gpsRows] = await gpsJob.getQueryResults();
      gpsRows.forEach((row, index) => {
        console.log(`   Registro ${index + 1}:`, JSON.stringify(row, null, 4));
      });
    } catch (error) {
      console.log(`❌ Error verificando esquema GPS: ${error.message}`);
    }

    // Verificar esquema tabla Mobile
    console.log('\n📱 Esquema tabla Mobile:');
    try {
      const mobileTable = dataset.table(process.env.BIGQUERY_MOBILE_TABLE_ID);
      const [metadata] = await mobileTable.getMetadata();
      console.log('Campos disponibles:');
      metadata.schema.fields.forEach(field => {
        console.log(`   - ${field.name} (${field.type})`);
      });

      // Obtener algunos registros de ejemplo
      console.log('\n📊 Registros de ejemplo Mobile:');
      const mobileQuery = `
        SELECT *
        FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BIGQUERY_DATASET_ID}.${process.env.BIGQUERY_MOBILE_TABLE_ID}\`
        LIMIT 3
      `;
      const [mobileJob] = await bigquery.createQueryJob({ query: mobileQuery, location: 'US' });
      const [mobileRows] = await mobileJob.getQueryResults();
      mobileRows.forEach((row, index) => {
        console.log(`   Registro ${index + 1}:`, JSON.stringify(row, null, 4));
      });
    } catch (error) {
      console.log(`❌ Error verificando esquema Mobile: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

checkSchema().catch(console.error);