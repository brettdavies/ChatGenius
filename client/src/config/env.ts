import { envSchema, type EnvSchema } from './env.schema';

// Log current environment (without exposing sensitive values)
console.log(`🌍 Running in ${import.meta.env.VITE_NODE_ENV || 'development'} mode`);

// Note: Vite requires specific environment file names:
// - .env.development (not .env.dev) for development mode
// - .env.production (not .env.prod) for production mode
// - .env.test for test mode
// See: https://vitejs.dev/guide/env-and-mode.html

// Validate environment variables
const result = envSchema.safeParse(import.meta.env);

if (!result.success) {
  console.error('❌ Invalid environment variables:', result.error.format());
  throw new Error('Invalid environment variables');
}

// Export validated environment variables
export const ENV: EnvSchema = result.data;

// Export individual variables for convenience
export const {
  VITE_NODE_ENV,
  VITE_API_URL,
  VITE_APP_NAME,
  VITE_APP_DESCRIPTION,
  VITE_APP_VERSION,
  VITE_API_TIMEOUT,
  VITE_API_RETRY_ATTEMPTS,
  VITE_ENABLE_2FA,
  VITE_ENABLE_FILE_UPLOAD,
  VITE_ENABLE_RICH_TEXT,
  VITE_MAX_MESSAGE_LENGTH,
  VITE_MAX_CHANNEL_NAME_LENGTH,
  VITE_MAX_USERNAME_LENGTH,
  VITE_WS_RECONNECT_INTERVAL,
  VITE_WS_MAX_RECONNECT_ATTEMPTS,
  VITE_CACHE_TTL,
  VITE_MAX_CACHED_MESSAGES,
} = ENV; 