import { DBSyncService } from './services/dbsync';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testConnection() {
  const dbSyncService = new DBSyncService({
    host: process.env.DBSYNC_HOST!,
    port: parseInt(process.env.DBSYNC_PORT || '5432'),
    database: process.env.DBSYNC_DB!,
    user: process.env.DBSYNC_USER!,
    password: process.env.DBSYNC_PASSWORD!
  });

  try {
    // Test getting latest block
    const latestBlock = await dbSyncService.getLatestBlock();
    console.log('Latest block:', latestBlock);

    // Test getting UTXOs for a test address (preprod test address)
    const testAddress = 'addr_test1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwq2ytjqp';
    const utxos = await dbSyncService.getUtxosForAddress(testAddress);
    console.log('UTXOs:', utxos);

    console.log('Connection successful!');
  } catch (error) {
    console.error('Connection failed:', error);
  } finally {
    // Always close the connection
    try {
      await dbSyncService.close();
      console.log('DBSync connection closed successfully');
    } catch (error) {
      console.error('Error closing DBSync connection:', error);
    }
  }
}

// Run the test and handle process exit
testConnection().then(() => {
  console.log('Test completed');
  process.exit(0);
}).catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
}); 