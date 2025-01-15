import { beforeAll, afterAll } from '@jest/globals';
import dotenv from 'dotenv';
import pool from '../src/db/pool.js';

// Load test environment variables
dotenv.config({ path: '.env.test' });

const TEST_SCHEMA = 'test_schema';

// Ensure database connection and setup test schema before tests
beforeAll(async () => {
  try {
    // Create test schema if it doesn't exist
    await pool.query(`CREATE SCHEMA IF NOT EXISTS ${TEST_SCHEMA}`);
    
    // Set search path to test schema
    await pool.query(`SET search_path TO ${TEST_SCHEMA}`);
    
    // Create tables in test schema
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${TEST_SCHEMA}.users (
        id VARCHAR(26) PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user' NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMPTZ
      );
    `);

    console.log('Test schema and tables created successfully');
  } catch (error) {
    console.error('Failed to setup test database:', error);
    await pool.end();
    process.exit(1);
  }
});

// Clean up test schema after all tests
afterAll(async () => {
  try {
    // Drop the test schema and all its objects
    await pool.query(`DROP SCHEMA IF EXISTS ${TEST_SCHEMA} CASCADE`);
    console.log('Test schema cleaned up successfully');
  } catch (error) {
    console.error('Failed to cleanup test schema:', error);
  } finally {
    // Ensure pool is ended even if cleanup fails
    await pool.end().catch((err: Error) => {
      console.error('Failed to close pool:', err);
    });
  }
}); 