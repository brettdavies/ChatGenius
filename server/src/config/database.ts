import { Pool } from 'pg';

// Create and export database pool
export const pool = new Pool({
  // Connection settings
  host: process.env.PGHOST || 'roundhouse.proxy.rlwy.net',
  port: parseInt(process.env.PGPORT || '54509', 10),
  database: process.env.PGDATABASE || 'railway',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD,
  
  // SSL settings
  ssl: { rejectUnauthorized: false },
  
  // Timeouts
  connectionTimeoutMillis: 5000,
  query_timeout: 10000,
  statement_timeout: 10000
}); 