import pool from '../src/db/pool';

export default async function globalTeardown() {
  // Ensure all database connections are closed
  await pool.end().catch((err: Error) => {
    console.error('Failed to close pool during teardown:', err);
  });
} 