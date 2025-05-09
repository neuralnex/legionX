import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Listing } from '../entities/Listing';
import { Purchase } from '../entities/Purchase';
import { Agent } from '../entities/Agent';
import { DBSyncService } from '../services/dbsync';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'legionx',
  entities: [User, Listing, Purchase, Agent],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
  migrations: ['src/migrations/*.ts'],
  migrationsRun: true,
});

// Initialize DBSync service
export const dbSyncService = new DBSyncService({
  host: process.env.DBSYNC_HOST || 'localhost',
  port: parseInt(process.env.DBSYNC_PORT || '5432'),
  database: process.env.DBSYNC_DB || 'dbsync',
  user: process.env.DBSYNC_USER || 'postgres',
  password: process.env.DBSYNC_PASSWORD || 'postgres',
}); 