import { beforeAll, afterAll } from '@jest/globals';
import dotenv from 'dotenv';
import { pool } from '../src/db/pool';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Ensure database connection before tests
beforeAll(async () => {
  try {
    // Test database connection
    await pool.query('SELECT 1');
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  }
});

// Close database connection after tests
afterAll(async () => {
  await pool.end();
}); 