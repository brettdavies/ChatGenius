import pkg from 'pg';
const { Pool } = pkg;
import { ENV } from './env.js';

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

export const pool = new Pool({
  user: ENV.DB.USER,
  password: ENV.DB.PASSWORD,
  host: ENV.DB.HOST,
  port: ENV.DB.PORT,
  database: ENV.DB.NAME,
  // Disable SSL for Docker environment
  ssl: false,
  // Connection settings
  connectionTimeoutMillis: 10000, // 10 seconds
  idleTimeoutMillis: 30000, // 30 seconds
  max: 20 // Maximum number of clients in the pool
});

// Test the connection with retries
export const connectWithRetry = async (retries = MAX_RETRIES): Promise<void> => {
  try {
    const client = await pool.connect();
    console.log('Database connected successfully');
    client.release();
  } catch (err) {
    console.error('Error connecting to the database:', err);
    if (retries > 0) {
      console.log(`Retrying connection in ${RETRY_DELAY/1000} seconds... (${retries} attempts remaining)`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return connectWithRetry(retries - 1);
    } else {
      console.error('Max retries reached. Could not connect to database.');
      process.exit(1); // Exit if we can't connect to the database
    }
  }
};

// Initialize connection
connectWithRetry();

export default pool; 