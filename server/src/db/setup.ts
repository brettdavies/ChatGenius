import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME
  });

  try {
    // Read and execute migration file
    const migrationPath = path.join(__dirname, 'migrations', '001_initial_schema.sql');
    const migration = fs.readFileSync(migrationPath, 'utf8');
    
    await pool.query(migration);
    console.log('Database schema created successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run setup if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  setupDatabase().catch(console.error);
}

export { setupDatabase }; 