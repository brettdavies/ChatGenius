import { PoolClient, QueryResult } from 'pg';
import pool from './db.js';

async function testConnection(): Promise<void> {
  let client: PoolClient | null = null;
  
  try {
    // Try to connect and run a simple query
    client = await pool.connect();
    const result: QueryResult = await client.query('SELECT NOW()');
    console.log('✅ Database connection successful!');
    console.log('Current timestamp from DB:', result.rows[0].now);
  } catch (err) {
    console.error('❌ Error connecting to the database:', err instanceof Error ? err.message : String(err));
  } finally {
    // Release the client if it was acquired
    if (client) {
      client.release();
    }
    // Close the pool
    await pool.end();
  }
}

// Run the test
testConnection(); 