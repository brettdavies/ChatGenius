/**
 * Core database setup functionality.
 * This module contains the low-level database operations for setting up the ChatGenius database.
 * It is used by the setup-cli.ts script but can also be used programmatically.
 * 
 * Note: This module does not handle SSH tunneling. For SSH tunnel support, use the setup-cli.ts script.
 */

import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

let pool: Pool;

async function initializePool(isTest = false) {
  pool = new Pool({
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: 'localhost',
    port: 5432,
    database: process.env.POSTGRES_DB
  });

  if (isTest) {
    const client = await pool.connect();
    try {
      // Create test schema if it doesn't exist
      await client.query('CREATE SCHEMA IF NOT EXISTS test');
      await client.query('SET search_path TO test');
      console.log('Created test schema');
    } finally {
      client.release();
    }
  }

  return pool;
}

async function dropExistingTables(isTest = false) {
  const client = await pool.connect();
  try {
    if (isTest) {
      await client.query('SET search_path TO test');
    }
    
    // Get all tables in the current schema
    const result = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = $1
    `, [isTest ? 'test' : 'public']);

    // Drop each table with CASCADE
    for (const row of result.rows) {
      await client.query(`DROP TABLE IF EXISTS ${row.tablename} CASCADE`);
    }
  } finally {
    client.release();
  }
}

async function executeSchemaFile(filePath: string, isTest = false) {
  const sql = fs.readFileSync(filePath, 'utf8');
  const client = await pool.connect();
  try {
    if (isTest) {
      await client.query('SET search_path TO test');
    }
    console.log(`Executing schema file: ${path.basename(filePath)}`);
    await client.query(sql);
    console.log(`Successfully executed: ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`Error executing ${path.basename(filePath)}:`, error);
    throw error;
  } finally {
    client.release();
  }
}

export async function setupDatabase(isTest = false) {
  try {
    // Initialize pool
    pool = await initializePool(isTest);

    // Drop existing tables
    await dropExistingTables(isTest);

    // Get all schema files
    const schemaDir = path.resolve(__dirname, '../schema');
    const schemaFiles = fs.readdirSync(schemaDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    // Execute each schema file
    for (const file of schemaFiles) {
      await executeSchemaFile(path.join(schemaDir, file), isTest);
    }

    console.log('Database setup completed successfully');
    return { pool };
  } catch (error) {
    console.error('Database setup failed:', error);
    if (pool) {
      await pool.end();
    }
    throw error;
  }
}

export { pool }; 