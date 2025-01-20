import pkg, { PoolClient as IPoolClient, QueryResult as IQueryResult } from 'pg';
const { Pool } = pkg;

// Create a new pool with the correct configuration
const pool = new Pool({
  host: 'localhost',
  port: 5438,  // Match the exposed port in docker-compose
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

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