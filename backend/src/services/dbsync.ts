import { Pool } from 'pg';
import { UTXO, TransactionDetails } from '../config/database';

interface DBSyncConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

export class DBSyncService {
  private pool: Pool;

  constructor(config: DBSyncConfig) {
    this.pool = new Pool(config);
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
        GROUP BY tx.hash`,
        [txHash]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return {
        hash: result.rows[0].hash,
        metadata: result.rows[0].metadata
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
        tx_hash: row.tx_hash,
        tx_index: row.tx_index,
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