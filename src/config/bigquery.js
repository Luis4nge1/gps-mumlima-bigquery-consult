import { BigQuery } from '@google-cloud/bigquery';
import dotenv from 'dotenv';

dotenv.config();

const bigquery = new BigQuery({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  location: process.env.BIGQUERY_LOCATION || 'US'
});

export const config = {
  projectId: process.env.GCP_PROJECT_ID,
  datasetId: process.env.BIGQUERY_DATASET_ID,
  gpsTableId: process.env.BIGQUERY_GPS_TABLE_ID,
  mobileTableId: process.env.BIGQUERY_MOBILE_TABLE_ID
};

export default bigquery;