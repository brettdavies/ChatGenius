import { Pool } from 'pg';

// Create and export database pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
}); 