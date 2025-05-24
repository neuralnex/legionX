import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Listing } from '../entities/Listing';
import { Purchase } from '../entities/Purchase';
import { Agent } from '../entities/Agent';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Check for DATABASE_URL first
if (!process.env.DATABASE_URL) {
  // Validate required environment variables if DATABASE_URL is not present
  const requiredEnvVars = {
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
  };

  // Check for missing environment variables
  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(`Missing required database environment variables: ${missingVars.join(', ')}`);
  }
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Listing, Purchase, Agent],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  migrations: ['src/migrations/*.ts'],
  migrationsRun: true,
});

// DBSync service for blockchain data
export class DBSyncService {
  async getUtxosForAddress(address: string): Promise<UTXO[]> {
    // Implementation will depend on  DBSync setup
    // This is a placeholder implementation
    return [];
  }

  async getTransactionDetails(txHash: string): Promise<TransactionDetails | null> {
    // Implementation will depend on DBSync setup
    // This is a placeholder implementation
    return null;
  }
}

export const dbSyncService = new DBSyncService();

// Types for DBSync
export interface UTXO {
  tx_hash: string;
  tx_index: number;
  assets: {
    [assetId: string]: number;
  };
}

export interface TransactionDetails {
  hash: string;
  block_no: number;
  metadata: {
    [key: string]: {
      msg?: string;
      ipfs?: string;
    };
  };
} 