import pkg from 'pg';
const { Client } = pkg;
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';
import type { ClientConfig } from 'pg';

// Load test environment variables
config({ path: '../server/.env.test' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function initTestDb(): Promise<void> {
  // Define base client configuration
  const baseConfig: ClientConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10)
  };

  // First connect to postgres database
  const client = new Client({
    ...baseConfig,
    database: 'postgres'
  });

  try {
    await client.connect();
    
    const dbName = process.env.DB_NAME;
    if (!dbName) {
      throw new Error('DB_NAME environment variable is not set');
    }

    // Drop test database if it exists
    await client.query(`
      DROP DATABASE IF EXISTS ${dbName};
    `);

    // Create test database
    await client.query(`
      CREATE DATABASE ${dbName}
      WITH 
        ENCODING = 'UTF8'
        LC_COLLATE = 'en_US.UTF-8'
        LC_CTYPE = 'en_US.UTF-8'
        TEMPLATE template0;
    `);

    // Close connection to postgres database
    await client.end();

    // Connect to test database
    const testClient = new Client({
      ...baseConfig,
      database: dbName
    });

    await testClient.connect();

    // Read and execute the test schema
    const sqlPath = join(__dirname, 'init.test.sql');
    const sql = await readFile(sqlPath, 'utf8');
    
    // Execute the SQL script
    await testClient.query(sql);

    console.log('✅ Test database initialized successfully');
    await testClient.end();
  } catch (error) {
    console.error('❌ Error initializing test database:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run the initialization
initTestDb(); 