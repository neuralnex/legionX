import { DBSyncService } from '../services/dbsync.ts';

// Validate required environment variables
const requiredEnvVars = {
  DBSYNC_HOST: process.env.DBSYNC_HOST,
  DBSYNC_DB: process.env.DBSYNC_DB,
  DBSYNC_USER: process.env.DBSYNC_USER,
  DBSYNC_PASSWORD: process.env.DBSYNC_PASSWORD,
};

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

export const dbSyncService = new DBSyncService({
  host: requiredEnvVars.DBSYNC_HOST!,
  port: parseInt(process.env.DBSYNC_PORT || '5432'),
  database: requiredEnvVars.DBSYNC_DB!,
  user: requiredEnvVars.DBSYNC_USER!,
  password: requiredEnvVars.DBSYNC_PASSWORD!,
});