import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.dev';
const envPath = join(__dirname, '../../', envFile);

config({ path: envPath });

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  
  // URLs
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  API_URL: process.env.API_URL || 'http://localhost:5001',
  
  // Database
  DB: {
    HOST: process.env.DB_HOST || 'localhost',
    PORT: parseInt(process.env.DB_PORT || '5432', 10),
    NAME: process.env.DB_NAME || 'chatgenius',
    USER: process.env.DB_USER || 'postgres',
    PASSWORD: process.env.DB_PASSWORD || 'postgres'
  },

  // JWT
  JWT: {
    SECRET: process.env.JWT_SECRET || 'dev-jwt-secret-key',
    REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-key'
  },

  // Session
  SESSION_SECRET: process.env.SESSION_SECRET || 'dev-session-secret-key',

  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
  }
} as const;

// Type checking to ensure all required environment variables are present
const requiredEnvVars = [
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'SESSION_SECRET'
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`Warning: ${envVar} is not set in environment variables`);
  }
}

export type EnvConfig = typeof ENV; 