import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const dbsync = new Pool({
  host: process.env.DBSYNC_HOST,
  port: parseInt(process.env.DBSYNC_PORT || "5432"),
  user: process.env.DBSYNC_USER,
  password: process.env.DBSYNC_PASSWORD,
  database: process.env.DBSYNC_NAME,
});

/**
 * Fetch recent transactions sent to a specific address
 */
export async function getTxsAtAddress(address: string) {
  const result = await dbsync.query(
    `
    SELECT tx.hash AS tx_hash
    FROM tx
    JOIN tx_out ON tx.id = tx_out.tx_id
    JOIN address ON tx_out.address = address.address
    WHERE tx_out.address = $1
    ORDER BY tx.block_index DESC
    LIMIT 50;
    `,
    [address]
  );
  return result.rows;
}

/**
 * Fetch outputs for a given transaction hash
 */
export async function getTxOutputs(txHash: string) {
  const result = await dbsync.query(
    `
    SELECT 
      tx_out.address,
      ma.policy || ma.name AS unit,
      ma.name,
      policy,
      value.quantity,
      value.asset_id
    FROM tx
    JOIN tx_out ON tx.id = tx_out.tx_id
    LEFT JOIN ma_tx_out ON tx_out.id = ma_tx_out.tx_out_id
    LEFT JOIN multi_asset ma ON ma_tx_out.ident = ma.id
    LEFT JOIN (
      SELECT asset.id AS asset_id, asset.policy, asset.name, ma_tx_out.quantity
      FROM ma_tx_out
      JOIN multi_asset asset ON ma_tx_out.ident = asset.id
    ) AS value ON ma.id = value.asset_id
    WHERE tx.hash = $1;
    `,
    [txHash]
  );
  return result.rows;
}

/**
 * Fetch transaction metadata for a given hash
 */
export async function getTxMetadata(txHash: string) {
  const result = await dbsync.query(
    `
    SELECT 
      json -> 'metadata' AS metadata
    FROM tx_metadata
    JOIN tx ON tx_metadata.tx_id = tx.id
    WHERE tx.hash = $1;
    `,
    [txHash]
  );

  if (result.rows.length > 0) {
    return result.rows[0].metadata;
  }

  return null;
}
