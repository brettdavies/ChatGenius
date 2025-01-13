import { Pool } from 'pg';
import { config } from '@/config';

export const pool = new Pool({
  connectionString: config.db.url,
  ssl: config.nodeEnv === 'production' ? {
    rejectUnauthorized: false
  } : undefined,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
}); 