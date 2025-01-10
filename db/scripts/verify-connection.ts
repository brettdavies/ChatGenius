import { Pool } from 'pg';
import { SSHTunnel } from '../src/shared/tunnel';

async function verifyConnection() {
  let tunnel: SSHTunnel | undefined;
  let pool: Pool | undefined;

  try {
    // Initialize and get the shared tunnel instance
    tunnel = SSHTunnel.initializeFromEnv();
    await tunnel.connect();
    
    console.log('SSH tunnel established, testing database connection...');
    
    pool = new Pool({
      host: 'localhost',
      port: 5432,
      database: process.env.POSTGRES_DB,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD
    });

    const result = await pool.query('SELECT version()');
    console.log('Successfully connected to database!');
    console.log('Database version:', result.rows[0].version);
    
    const tableResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\nAvailable tables:');
    tableResult.rows.forEach(row => console.log(`- ${row.table_name}`));
    
    // Clean exit
    console.log('\nVerification completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('\nVerification failed:');
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    // Clean up resources
    if (pool) {
      await pool.end();
    }
    if (tunnel?.isConnectedToTunnel()) {
      await tunnel.disconnect();
    }
  }
}

// Only run if called directly
if (require.main === module) {
  verifyConnection();
} 