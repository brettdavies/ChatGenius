/**
 * Database Setup CLI Script
 * 
 * This is the main entry point for setting up the ChatGenius database.
 * It provides a command-line interface and handles:
 * - Environment variable loading
 * - SSH tunnel setup and teardown
 * - Database setup (via db-core.ts)
 * - Error handling and cleanup
 * 
 * Usage:
 * - Normal setup: npm run setup
 * - Test setup: npm run setup:test
 */

import dotenv from 'dotenv';
import path from 'path';
import { SSHTunnel } from '../src/shared/tunnel';
import { setupDatabase } from './db-core';

// Load environment variables from server/.env.local
dotenv.config({ path: path.resolve(__dirname, '../../server/.env.local') });

async function main() {
  // Initialize and get the shared tunnel instance
  const tunnel = SSHTunnel.initializeFromEnv();
  try {
    await tunnel.connect();

    // Run database setup
    await setupDatabase();

    console.log('Database setup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  } finally {
    await SSHTunnel.getInstance().disconnect();
    SSHTunnel.resetInstance();
  }
}

// Run setup if this script is run directly
if (require.main === module) {
  main();
} 