import { Pool } from 'pg';

// Initialize database pool
export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});

// Add error handler
db.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default db; 