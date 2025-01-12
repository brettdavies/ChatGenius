import { Pool } from 'pg';

async function cleanupTestDatabase() {
  const pool = new Pool({
    connectionString: process.env.TEST_DATABASE_URL,
  });

  try {
    // Drop all tables in the test database
    await pool.query(`
      DO $$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
          EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
      END $$;
    `);
  } finally {
    await pool.end();
  }
}

export default async function globalTeardown() {
  try {
    await cleanupTestDatabase();
    console.log('Test database cleanup complete');
  } catch (error) {
    console.error('Failed to cleanup test database:', error);
    throw error;
  }
} 