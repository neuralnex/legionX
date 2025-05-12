import { Logger } from './logger';
import { NetworkError } from '../types/errors';
import { DBSyncService } from '../services/dbsync';
import { config } from 'dotenv';

config();

type TransactionStatus = 'pending' | 'confirmed' | 'failed';

interface TransactionInfo {
  status: TransactionStatus;
  lastChecked: Date;
  confirmations: number;
  error?: string;
}

export class TransactionMonitor {
  private transactions: Map<string, TransactionInfo>;
  private logger: Logger;
  private checkInterval: number = 10000; // 10 seconds
  private maxConfirmations: number = 20;
  private maxRetries: number = 3;
  private dbSync: DBSyncService;

  constructor() {
    this.transactions = new Map();
    this.logger = new Logger('TransactionMonitor');
    this.dbSync = new DBSyncService({
      host: process.env.DBSYNC_HOST || 'localhost',
      port: parseInt(process.env.DBSYNC_PORT || '5432'),
      database: process.env.DBSYNC_DATABASE || 'cexplorer',
      user: process.env.DBSYNC_USER || 'postgres',
      password: process.env.DBSYNC_PASSWORD || ''
    });
    this.startMonitoring();
  }

  private startMonitoring(): void {
    setInterval(() => this.checkTransactions(), this.checkInterval);
  }

  monitorTransaction(txHash: string): void {
    this.transactions.set(txHash, {
      status: 'pending',
      lastChecked: new Date(),
      confirmations: 0
    });
    this.logger.info(`Started monitoring transaction: ${txHash}`);
  }

  async getTransactionStatus(txHash: string): Promise<string> {
    const txInfo = this.transactions.get(txHash);
    if (!txInfo) {
      throw new NetworkError(`Transaction ${txHash} not found in monitor`);
    }
    return txInfo.status;
  }

  private async checkTransactions(): Promise<void> {
    for (const [txHash, txInfo] of this.transactions.entries()) {
      if (txInfo.status === 'confirmed' || txInfo.status === 'failed') {
        continue;
      }

      try {
        const isConfirmed = await this.checkTransactionConfirmation(txHash);
        
        if (isConfirmed) {
          txInfo.status = 'confirmed';
          txInfo.confirmations = this.maxConfirmations;
          this.logger.info(`Transaction ${txHash} confirmed`);
        } else {
          txInfo.lastChecked = new Date();
        }
      } catch (error) {
        this.logger.error(`Error checking transaction ${txHash}:`, error);
        if (txInfo.confirmations >= this.maxRetries) {
          txInfo.status = 'failed';
          txInfo.error = 'Max retries exceeded';
          this.logger.error(`Transaction ${txHash} failed after max retries`);
        }
      }
    }
  }

  private async checkTransactionConfirmation(txHash: string): Promise<boolean> {
    try {
      // Get transaction details from DBSync
      const txDetails = await this.dbSync.getTransactionDetails(txHash);
      
      if (!txDetails) {
        return false;
      }

      // Get current block height
      const latestBlock = await this.dbSync.getLatestBlock();
      const confirmations = latestBlock - txDetails.block_no;
      
      return confirmations >= this.maxConfirmations;
    } catch (error) {
      this.logger.error(`Error checking transaction confirmation: ${error}`);
      throw error;
    }
  }

  async close(): Promise<void> {
    await this.dbSync.close();
  }
} 