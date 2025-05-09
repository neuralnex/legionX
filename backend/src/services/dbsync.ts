import { Pool } from 'pg';

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

  async getTransactionDetails(txHash: string): Promise<any> {
    const result = await this.pool.query(
      `SELECT 
        tx.hash,
        tx.block_no,
        tx.block_index,
        tx.out_sum,
        tx.fee,
        tx.deposit,
        tx.size,
        tx.invalid_before,
        tx.invalid_hereafter,
        tx.valid_contract,
        tx.script_size
      FROM tx
      WHERE tx.hash = $1`,
      [txHash]
    );
    return result.rows[0];
  }

  async getUtxosForAddress(address: string): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT 
        tx_out.address,
        tx_out.value,
        tx_out.tx_hash,
        tx_out.index
      FROM tx_out
      WHERE tx_out.address = $1
      AND NOT EXISTS (
        SELECT 1 FROM tx_in
        WHERE tx_in.tx_out_id = tx_out.tx_id
        AND tx_in.tx_out_index = tx_out.index
      )`,
      [address]
    );
    return result.rows;
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