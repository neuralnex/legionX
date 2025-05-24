import { AppDataSource } from './config/database';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testConnection() {
  try {
    // Initialize the database connection
    await AppDataSource.initialize();
    console.log('PostgreSQL connection successful!');

    // Test a simple query
    const result = await AppDataSource.query('SELECT NOW()');
    console.log('Current database time:', result[0].now);

    // Test if we can create a table
    await AppDataSource.query(`
      CREATE TABLE IF NOT EXISTS test_table (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Test table created successfully');

    // Test inserting data
    await AppDataSource.query(`
      INSERT INTO test_table (name) 
      VALUES ('test entry')
    `);
    console.log('Test data inserted successfully');

    // Test reading data
    const testData = await AppDataSource.query(`
      SELECT * FROM test_table
    `);
    console.log('Test data retrieved:', testData);

  } catch (error) {
    console.error('Database connection failed:', error);
  } finally {
    // Close the connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Database connection closed successfully');
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