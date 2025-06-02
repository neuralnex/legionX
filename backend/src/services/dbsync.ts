import { Pool } from 'pg';
import { AppDataSource } from '../config/database.js';
import type { UTXO, TransactionDetails } from '../types/blockchain.js';

interface DBSyncConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

interface DbRow {
  [key: string]: any;
}

export class DBSyncService {
  private pool: Pool;

  constructor(config: DBSyncConfig) {
    this.pool = new Pool(config);
  }

  async initialize(): Promise<void> {
    try {
      // Test the connection
      const client = await this.pool.connect();
      client.release();
    } catch (error) {
      throw new Error(`Failed to initialize DBSync connection: ${error}`);
    }
  }

  async getLatestBlock(): Promise<number> {
    const result = await this.pool.query(
      'SELECT MAX(block_no) as latest_block FROM block'
    );
    return result.rows[0].latest_block || 0;
  }

  async getTransactionDetails(txHash: string): Promise<TransactionDetails | null> {
    try {
      const result = await this.pool.query(
        `SELECT 
          tx.hash,
          tx.block_no,
          COALESCE(
            jsonb_object_agg(
              key,
              jsonb_build_object(
                'msg', value->>'msg',
                'ipfs', value->>'ipfs'
              )
            ) FILTER (WHERE key IS NOT NULL),
            '{}'::jsonb
          ) as metadata
        FROM tx
        LEFT JOIN tx_metadata ON tx_metadata.tx_id = tx.id
        WHERE tx.hash = $1
        GROUP BY tx.hash, tx.block_no`,
        [txHash]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        txHash: row.hash,
        blockHeight: row.block_no,
        timestamp: Date.now(), // TODO: Get actual timestamp from block
        inputs: [], // TODO: Get actual inputs
        outputs: [], // TODO: Get actual outputs
        metadata: row.metadata
      };
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      throw new Error('Failed to fetch transaction details from DBSync');
    }
  }

  async getUtxosForAddress(address: string): Promise<UTXO[]> {
    try {
      const result = await this.pool.query(
        `SELECT 
          tx.hash as tx_hash,
          tx_out.index as tx_index,
          COALESCE(
            jsonb_object_agg(
              ma.policy || ma.name,
              ma_tx_out.quantity
            ) FILTER (WHERE ma.policy IS NOT NULL),
            '{}'::jsonb
          ) as assets
        FROM tx_out
        JOIN tx ON tx.id = tx_out.tx_id
        LEFT JOIN ma_tx_out ON ma_tx_out.tx_out_id = tx_out.id
        LEFT JOIN multi_asset ma ON ma.id = ma_tx_out.ident
        WHERE tx_out.address = $1
        AND NOT EXISTS (
          SELECT 1 FROM tx_in
          WHERE tx_in.tx_out_id = tx_out.tx_id
          AND tx_in.tx_out_index = tx_out.index
        )
        GROUP BY tx.hash, tx_out.index`,
        [address]
      );

      return result.rows.map(row => ({
        txHash: row.tx_hash,
        outputIndex: row.tx_index,
        amount: 0, // TODO: Get actual amount
        address: address,
        assets: row.assets
      }));
    } catch (error) {
      console.error('Error fetching UTXOs:', error);
      throw new Error('Failed to fetch UTXOs from DBSync');
    }
  }

  async getStakeAddressInfo(stakeAddress: string): Promise<any> {
    const result = await this.pool.query(
      `SELECT 
        stake_address.view as stake_address,
        stake_address.registration_tx_id,
        stake_address.registration_block_no,
        stake_address.registration_slot_no
      FROM stake_address
      WHERE stake_address.view = $1`,
      [stakeAddress]
    );
    return result.rows[0];
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
} 