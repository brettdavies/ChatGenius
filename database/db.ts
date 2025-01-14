import pkg from 'pg';
const { Pool } = pkg;
import { config } from 'dotenv';
import { join } from 'path';

// Load development environment variables
if (process.env.NODE_ENV === 'development') {
  config({ path: join(__dirname, '.env.dev') });
}

// Define pool configuration type
const poolConfig: pkg.PoolConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME
};

// Create a single pool instance
const pool = new Pool(poolConfig);

// Handle pool errors
pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool; 