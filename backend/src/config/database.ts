import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Listing } from '../entities/Listing';
import { Purchase } from '../entities/Purchase';
import { Agent } from '../entities/Agent';

export const AppDataSource = new DataSource({
  type: 'postgres',
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
    // Implementation will depend on your DBSync setup
    // This is a placeholder implementation
    return [];
  }

  async getTransactionDetails(txHash: string): Promise<TransactionDetails | null> {
    // Implementation will depend on your DBSync setup
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
  metadata: {
    [key: string]: {
      msg?: string;
      ipfs?: string;
    };
  };
} 