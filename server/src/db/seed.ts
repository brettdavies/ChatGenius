import { pool } from '../config/database';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';
import dotenv from 'dotenv';

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  const envPath = path.resolve(__dirname, '../../.env.local');
  console.log('Loading environment from:', envPath);
  dotenv.config({ path: envPath });
}

// Debug log
console.log('Database configuration:', {
  PGHOST: process.env.PGHOST,
  PGPORT: process.env.PGPORT,
  PGDATABASE: process.env.PGDATABASE,
  PGUSER: process.env.PGUSER,
  // Don't log the actual password
  PGPASSWORD: process.env.PGPASSWORD ? '[HIDDEN]' : undefined
});

async function runSeeds() {
  // Validate seed file exists
  const seedPath = path.join(__dirname, '../../../db/seeds/01_initial_data.sql');
  if (!fs.existsSync(seedPath)) {
    throw new Error(`Seed file not found at: ${seedPath}`);
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Read and execute seed file
    const seedSQL = fs.readFileSync(seedPath, 'utf8');
    
    logger.info('Running seed file:', seedPath);
    await client.query(seedSQL);
    
    await client.query('COMMIT');
    logger.info('Seeds completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error running seeds:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run seeds
runSeeds()
  .then(() => {
    logger.info('Database seeded successfully');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Failed to seed database:', error);
    process.exit(1);
  });