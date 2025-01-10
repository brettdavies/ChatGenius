import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD
});

// Test the connection with retries
const testConnection = async (retries = 5, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      console.log('Successfully connected to PostgreSQL database');
      client.release();
      return;
    } catch (err) {
      console.error(`Connection attempt ${i + 1} failed:`, err);
      if (i < retries - 1) {
        console.log(`Retrying in ${delay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw err;
      }
    }
  }
};

// Listen for notifications
const listenForNotifications = async () => {
  await testConnection();
  const client = await pool.connect();
  
  try {
    // Listen for different notification channels
    await client.query('LISTEN message_change');
    await client.query('LISTEN reaction_change');
    await client.query('LISTEN user_status_change');
    await client.query('LISTEN channel_member_change');

    client.on('notification', (msg) => {
      const payload = JSON.parse(msg.payload || '{}');
      global.eventEmitter.emit(msg.channel, payload);
    });

    console.log('Listening for PostgreSQL notifications');
  } catch (error) {
    console.error('Error setting up notification listeners:', error);
    client.release();
  }
};

export { pool, listenForNotifications }; 