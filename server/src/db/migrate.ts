import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
const { Pool } = pkg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create a new pool instance for migrations
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'chatgenius'
});

async function runMigrations() {
  const client = await pool.connect();
  try {
    // Create and set schema if in test environment
    const schemaName = process.env.SCHEMA_NAME;
    if (schemaName) {
      console.log(`Creating schema: ${schemaName}`);
      await client.query(`DROP SCHEMA IF EXISTS ${schemaName} CASCADE`);
      await client.query(`CREATE SCHEMA ${schemaName}`);
      await client.query(`SET search_path TO ${schemaName}`);
    }

    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
      console.log(`Running migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');
      
      await client.query(sql);
      console.log(`Completed migration: ${file}`);
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
}); 