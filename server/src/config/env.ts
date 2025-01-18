import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '../../.env.dev');

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
    COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || 'localhost',
    SESSION_MAX_AGE: parseInt(process.env.SESSION_MAX_AGE || '86400000', 10), // 24 hours in milliseconds
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
    },
    TOTP: {
      SETUP: {
        WINDOW_MS: parseInt(process.env.TOTP_SETUP_RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
        MAX_REQUESTS: parseInt(process.env.TOTP_SETUP_RATE_LIMIT_MAX_REQUESTS || '5', 10)
      },
      VERIFY: {
        WINDOW_MS: parseInt(process.env.TOTP_VERIFY_RATE_LIMIT_WINDOW_MS || '300000', 10), // 5 minutes
        MAX_REQUESTS: parseInt(process.env.TOTP_VERIFY_RATE_LIMIT_MAX_REQUESTS || '3', 10)
      },
      VALIDATE: {
        WINDOW_MS: 5 * 60 * 1000, // 5 minutes
        MAX_REQUESTS: 3 // Stricter limit for login attempts
      }
    },
    CHANNELS: {
      CREATE: {
        WINDOW_MS: parseInt(process.env.CHANNEL_CREATE_RATE_LIMIT_WINDOW_MS || '3600000', 10), // 1 hour
        MAX_REQUESTS: parseInt(process.env.CHANNEL_CREATE_RATE_LIMIT_MAX_REQUESTS || '10', 10)
      },
      UPDATE: {
        WINDOW_MS: parseInt(process.env.CHANNEL_UPDATE_RATE_LIMIT_WINDOW_MS || '60000', 10), // 1 minute
        MAX_REQUESTS: parseInt(process.env.CHANNEL_UPDATE_RATE_LIMIT_MAX_REQUESTS || '30', 10)
      },
      MEMBERS: {
        WINDOW_MS: parseInt(process.env.CHANNEL_MEMBERS_RATE_LIMIT_WINDOW_MS || '300000', 10), // 5 minutes
        MAX_REQUESTS: parseInt(process.env.CHANNEL_MEMBERS_RATE_LIMIT_MAX_REQUESTS || '50', 10)
      },
      DELETE: {
        WINDOW_MS: parseInt(process.env.CHANNEL_DELETE_RATE_LIMIT_WINDOW_MS || '3600000', 10), // 1 hour
        MAX_REQUESTS: parseInt(process.env.CHANNEL_DELETE_RATE_LIMIT_MAX_REQUESTS || '10', 10)
      },
      ARCHIVE: {
        WINDOW_MS: parseInt(process.env.CHANNEL_ARCHIVE_RATE_LIMIT_WINDOW_MS || '3600000', 10), // 1 hour
        MAX_REQUESTS: parseInt(process.env.CHANNEL_ARCHIVE_RATE_LIMIT_MAX_REQUESTS || '10', 10)
      },
      READ: {
        WINDOW_MS: parseInt(process.env.CHANNEL_READ_RATE_LIMIT_WINDOW_MS || '60000', 10), // 1 minute
        MAX_REQUESTS: parseInt(process.env.CHANNEL_READ_RATE_LIMIT_MAX_REQUESTS || '100', 10)
      }
    },
    EVENTS: {
      SUBSCRIPTION: {
        WINDOW_MS: 60 * 60 * 1000, // 1 hour
        MAX_REQUESTS: 1 // 1 connection per channel per user
      },
      TYPING: {
        WINDOW_MS: 60 * 1000, // 1 minute
        MAX_REQUESTS: 30 // 30 updates per minute
      },
      PRESENCE: {
        WINDOW_MS: 60 * 1000, // 1 minute
        MAX_REQUESTS: 60 // 60 updates per minute
      }
    },
    MESSAGES: {
      CREATE: {
        WINDOW_MS: 60 * 1000, // 1 minute
        MAX_REQUESTS: 30 // 30 messages per minute
      },
      UPDATE: {
        WINDOW_MS: 60 * 1000, // 1 minute
        MAX_REQUESTS: 30 // 30 updates per minute
      },
      DELETE: {
        WINDOW_MS: 60 * 1000, // 1 minute
        MAX_REQUESTS: 20 // 20 deletes per minute
      },
      REACTIONS: {
        WINDOW_MS: 60 * 1000, // 1 minute
        MAX_REQUESTS: 60 // 60 reactions per minute
      },
      SEARCH: {
        WINDOW_MS: 60 * 1000, // 1 minute
        MAX_REQUESTS: 30 // 30 searches per minute
      }
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