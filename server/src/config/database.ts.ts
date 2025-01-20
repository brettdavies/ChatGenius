import { Pool } from 'pg';
import { ENV } from './env.js';

export const pool = new Pool({
  user: ENV.DB.USER,
  password: ENV.DB.PASSWORD,
  host: ENV.DB.HOST,
  port: ENV.DB.PORT,
  database: ENV.DB.NAME,
  ssl: false // Disable SSL requirement for now
});

// Test the connection
pool.connect()
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Error connecting to the database:', err));

export default pool; 