import pkg, { PoolClient as IPoolClient, QueryResult as IQueryResult } from 'pg';
const { Pool } = pkg;
import pool from './db.js';

async function testConnection(): Promise<void> {
  let client: IPoolClient | null = null;
  
  try {
    // Try to connect and run a simple query
    client = await pool.connect();
    const result: IQueryResult = await client.query('SELECT NOW()');
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