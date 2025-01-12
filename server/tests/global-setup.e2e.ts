import { Pool } from 'pg';
import { promises as fs } from 'fs';
import path from 'path';

async function setupTestDatabase() {
  const pool = new Pool({
    connectionString: process.env.TEST_DATABASE_URL,
  });

  try {
    // Read and execute schema files
    const schemaDir = path.join(__dirname, '../../db/schema');
    const schemaFiles = await fs.readdir(schemaDir);
    
    for (const file of schemaFiles.sort()) {
      if (file.endsWith('.sql')) {
        const schema = await fs.readFile(path.join(schemaDir, file), 'utf-8');
        await pool.query(schema);
      }
    }

    // Read and execute seed files if they exist
    const seedDir = path.join(__dirname, '../__tests__/seeds');
    try {
      const seedFiles = await fs.readdir(seedDir);
      for (const file of seedFiles.sort()) {
        if (file.endsWith('.sql')) {
          const seed = await fs.readFile(path.join(seedDir, file), 'utf-8');
          await pool.query(seed);
        }
      }
    } catch (err) {
      // Seed directory might not exist, which is fine
      console.log('No seed files found');
    }
  } finally {
    await pool.end();
  }
}

export default async function globalSetup() {
  try {
    await setupTestDatabase();
    console.log('Test database setup complete');
  } catch (error) {
    console.error('Failed to setup test database:', error);
    throw error;
  }
} 