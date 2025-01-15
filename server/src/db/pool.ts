import pkg from 'pg';
const { Pool } = pkg;
import { ENV } from '../config/env.js';

// Get the schema name based on environment
const getSchema = () => {
  return process.env.NODE_ENV === 'test'
    ? (process.env.SCHEMA_NAME || ENV.DB.TEST_SCHEMA)
    : ENV.DB.SCHEMA;
};

// Create a new pool with the configuration
const pool = new Pool({
  user: ENV.DB.USER,
  password: ENV.DB.PASSWORD,
  host: ENV.DB.HOST,
  port: ENV.DB.PORT,
  database: ENV.DB.NAME,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  options: `-c search_path=${getSchema()},public`
});

// Set schema for all connections
pool.on('connect', async (client) => {
  try {
    const schema = getSchema();
    // Create schema if it doesn't exist and set search path in a single transaction
    await client.query('BEGIN');
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
    await client.query(`SET search_path TO ${schema}, public`);
    await client.query('COMMIT');
  } catch (error) {
    console.error('Error setting schema:', error);
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Error rolling back transaction:', rollbackError);
    }
  }
});

// Test the connection
pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Database connected successfully');
  }
});

export default pool; 