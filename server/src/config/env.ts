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
  API_URL: process.env.API_URL || 'http://localhost:5000',
  
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  // Database
  DB: {
    HOST: process.env.DB_HOST || 'localhost',
    PORT: parseInt(process.env.DB_PORT || '5432', 10),
    NAME: process.env.DB_NAME || 'chatgenius',
    USER: process.env.DB_USER || 'postgres',
    PASSWORD: process.env.DB_PASSWORD || 'postgres',
    TEST_NAME: process.env.DB_TEST_NAME || 'chatgenius_test',
    SCHEMA: process.env.DB_SCHEMA || 'public',
    TEST_SCHEMA: process.env.DB_TEST_SCHEMA || 'test'
  },

  // Authentication
  AUTH: {
    JWT_SECRET: process.env.JWT_SECRET || 'dev-jwt-secret-key',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-key',
    JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '15m',
    JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',
    SESSION_SECRET: process.env.SESSION_SECRET || 'dev-session-secret-key',
    COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || 'localhost'
  },

  // Rate Limiting
  RATE_LIMIT: {
    AUTH: {
      WINDOW_MS: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
      MAX_REQUESTS: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || '5', 10)
    },
    API: {
      WINDOW_MS: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
      MAX_REQUESTS: parseInt(process.env.API_RATE_LIMIT_MAX_REQUESTS || '100', 10)
    }
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

// Check for missing required environment variables in production
if (ENV.NODE_ENV === 'production') {
  const missingVars = requiredEnvVars.filter(key => !process.env[key]);
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

export type EnvConfig = typeof ENV; 