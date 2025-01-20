import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { envSchema } from './env.schema.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment file based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production'
  : process.env.NODE_ENV === 'test'
    ? '.env.test'
    : '.env.development';

const envPath = join(__dirname, '../../', envFile);
config({ path: envPath });

// Parse and validate environment variables
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

const env = parsedEnv.data;

// Structured environment configuration
export const ENV = {
  NODE_ENV: env.NODE_ENV,
  PORT: env.PORT,
  
  // URLs
  CLIENT_URL: env.CLIENT_URL,
  API_URL: env.API_URL,
  CORS_ORIGIN: env.CORS_ORIGIN,
  
  // Database
  DB: {
    HOST: env.DB_HOST,
    PORT: env.DB_PORT,
    NAME: env.DB_NAME,
    USER: env.DB_USER,
    PASSWORD: env.DB_PASSWORD,
    TEST_NAME: env.DB_TEST_NAME,
    SCHEMA: env.DB_SCHEMA,
    TEST_SCHEMA: env.DB_TEST_SCHEMA
  },

  // Authentication
  AUTH: {
    SESSION_SECRET: env.SESSION_SECRET,
    COOKIE_DOMAIN: env.COOKIE_DOMAIN,
    SESSION_MAX_AGE: env.SESSION_MAX_AGE,
  },

  // Rate Limiting
  RATE_LIMIT: {
    AUTH: {
      WINDOW_MS: env.AUTH_RATE_LIMIT_WINDOW_MS,
      MAX_REQUESTS: env.AUTH_RATE_LIMIT_MAX_REQUESTS
    },
    API: {
      WINDOW_MS: env.API_RATE_LIMIT_WINDOW_MS,
      MAX_REQUESTS: env.API_RATE_LIMIT_MAX_REQUESTS
    },
    TOTP: {
      SETUP: {
        WINDOW_MS: env.TOTP_SETUP_RATE_LIMIT_WINDOW_MS,
        MAX_REQUESTS: env.TOTP_SETUP_RATE_LIMIT_MAX_REQUESTS
      },
      VERIFY: {
        WINDOW_MS: env.TOTP_VERIFY_RATE_LIMIT_WINDOW_MS,
        MAX_REQUESTS: env.TOTP_VERIFY_RATE_LIMIT_MAX_REQUESTS
      },
      VALIDATE: {
        WINDOW_MS: env.TOTP_VALIDATE_RATE_LIMIT_WINDOW_MS,
        MAX_REQUESTS: env.TOTP_VALIDATE_RATE_LIMIT_MAX_REQUESTS
      }
    },
    CHANNELS: {
      CREATE: {
        WINDOW_MS: env.CHANNEL_CREATE_RATE_LIMIT_WINDOW_MS,
        MAX_REQUESTS: env.CHANNEL_CREATE_RATE_LIMIT_MAX_REQUESTS
      },
      UPDATE: {
        WINDOW_MS: env.CHANNEL_UPDATE_RATE_LIMIT_WINDOW_MS,
        MAX_REQUESTS: env.CHANNEL_UPDATE_RATE_LIMIT_MAX_REQUESTS
      },
      MEMBERS: {
        WINDOW_MS: env.CHANNEL_MEMBERS_RATE_LIMIT_WINDOW_MS,
        MAX_REQUESTS: env.CHANNEL_MEMBERS_RATE_LIMIT_MAX_REQUESTS
      },
      DELETE: {
        WINDOW_MS: env.CHANNEL_DELETE_RATE_LIMIT_WINDOW_MS,
        MAX_REQUESTS: env.CHANNEL_DELETE_RATE_LIMIT_MAX_REQUESTS
      },
      ARCHIVE: {
        WINDOW_MS: env.CHANNEL_ARCHIVE_RATE_LIMIT_WINDOW_MS,
        MAX_REQUESTS: env.CHANNEL_ARCHIVE_RATE_LIMIT_MAX_REQUESTS
      },
      READ: {
        WINDOW_MS: env.CHANNEL_READ_RATE_LIMIT_WINDOW_MS,
        MAX_REQUESTS: env.CHANNEL_READ_RATE_LIMIT_MAX_REQUESTS
      }
    },
    EVENTS: {
      SUBSCRIPTION: {
        WINDOW_MS: env.EVENT_SUBSCRIPTION_RATE_LIMIT_WINDOW_MS,
        MAX_REQUESTS: env.EVENT_SUBSCRIPTION_RATE_LIMIT_MAX_REQUESTS
      },
      TYPING: {
        WINDOW_MS: env.EVENT_TYPING_RATE_LIMIT_WINDOW_MS,
        MAX_REQUESTS: env.EVENT_TYPING_RATE_LIMIT_MAX_REQUESTS
      },
      PRESENCE: {
        WINDOW_MS: env.EVENT_PRESENCE_RATE_LIMIT_WINDOW_MS,
        MAX_REQUESTS: env.EVENT_PRESENCE_RATE_LIMIT_MAX_REQUESTS
      }
    },
    MESSAGES: {
      CREATE: {
        WINDOW_MS: env.MESSAGE_CREATE_RATE_LIMIT_WINDOW_MS,
        MAX_REQUESTS: env.MESSAGE_CREATE_RATE_LIMIT_MAX_REQUESTS
      },
      UPDATE: {
        WINDOW_MS: env.MESSAGE_UPDATE_RATE_LIMIT_WINDOW_MS,
        MAX_REQUESTS: env.MESSAGE_UPDATE_RATE_LIMIT_MAX_REQUESTS
      },
      DELETE: {
        WINDOW_MS: env.MESSAGE_DELETE_RATE_LIMIT_WINDOW_MS,
        MAX_REQUESTS: env.MESSAGE_DELETE_RATE_LIMIT_MAX_REQUESTS
      },
      REACTIONS: {
        WINDOW_MS: env.MESSAGE_REACTIONS_RATE_LIMIT_WINDOW_MS,
        MAX_REQUESTS: env.MESSAGE_REACTIONS_RATE_LIMIT_MAX_REQUESTS
      },
      SEARCH: {
        WINDOW_MS: env.MESSAGE_SEARCH_RATE_LIMIT_WINDOW_MS,
        MAX_REQUESTS: env.MESSAGE_SEARCH_RATE_LIMIT_MAX_REQUESTS
      }
    }
  }
} as const;

export type EnvConfig = typeof ENV; 