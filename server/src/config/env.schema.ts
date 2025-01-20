import { z } from 'zod';

// Helper function to create a number parser with default value
const numberWithDefault = (defaultValue: number) => 
  z.preprocess(
    (val) => Number(val) || defaultValue,
    z.number().positive()
  );

// Helper function to create a string parser with default value
const stringWithDefault = (defaultValue: string) => 
  z.string().default(defaultValue);

// Environment schema definition
export const envSchema = z.object({
  // Core settings
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: numberWithDefault(5000),

  // URLs
  CLIENT_URL: stringWithDefault('http://localhost:5173'),
  API_URL: stringWithDefault('http://localhost:5000'),
  CORS_ORIGIN: stringWithDefault('http://localhost:5173'),

  // Database
  DB_HOST: stringWithDefault('localhost'),
  DB_PORT: numberWithDefault(5432),
  DB_NAME: stringWithDefault('chatgenius'),
  DB_USER: stringWithDefault('postgres'),
  DB_PASSWORD: stringWithDefault('postgres'),
  DB_TEST_NAME: stringWithDefault('chatgenius_test'),
  DB_SCHEMA: stringWithDefault('public'),
  DB_TEST_SCHEMA: stringWithDefault('test'),

  // Authentication
  SESSION_SECRET: z.string().min(1),
  COOKIE_DOMAIN: stringWithDefault('localhost'),
  SESSION_MAX_AGE: numberWithDefault(86400000), // 24 hours

  // Rate Limiting - Auth
  AUTH_RATE_LIMIT_WINDOW_MS: numberWithDefault(900000), // 15 minutes
  AUTH_RATE_LIMIT_MAX_REQUESTS: numberWithDefault(50),

  // Rate Limiting - API
  API_RATE_LIMIT_WINDOW_MS: numberWithDefault(900000), // 15 minutes
  API_RATE_LIMIT_MAX_REQUESTS: numberWithDefault(100),

  // Rate Limiting - TOTP
  TOTP_SETUP_RATE_LIMIT_WINDOW_MS: numberWithDefault(900000), // 15 minutes
  TOTP_SETUP_RATE_LIMIT_MAX_REQUESTS: numberWithDefault(5),
  TOTP_VERIFY_RATE_LIMIT_WINDOW_MS: numberWithDefault(300000), // 5 minutes
  TOTP_VERIFY_RATE_LIMIT_MAX_REQUESTS: numberWithDefault(3),
  TOTP_VALIDATE_RATE_LIMIT_WINDOW_MS: numberWithDefault(300000), // 5 minutes
  TOTP_VALIDATE_RATE_LIMIT_MAX_REQUESTS: numberWithDefault(3),

  // Rate Limiting - Channels
  CHANNEL_CREATE_RATE_LIMIT_WINDOW_MS: numberWithDefault(3600000), // 1 hour
  CHANNEL_CREATE_RATE_LIMIT_MAX_REQUESTS: numberWithDefault(10),
  CHANNEL_UPDATE_RATE_LIMIT_WINDOW_MS: numberWithDefault(60000), // 1 minute
  CHANNEL_UPDATE_RATE_LIMIT_MAX_REQUESTS: numberWithDefault(30),
  CHANNEL_MEMBERS_RATE_LIMIT_WINDOW_MS: numberWithDefault(300000), // 5 minutes
  CHANNEL_MEMBERS_RATE_LIMIT_MAX_REQUESTS: numberWithDefault(50),
  CHANNEL_DELETE_RATE_LIMIT_WINDOW_MS: numberWithDefault(3600000), // 1 hour
  CHANNEL_DELETE_RATE_LIMIT_MAX_REQUESTS: numberWithDefault(10),
  CHANNEL_ARCHIVE_RATE_LIMIT_WINDOW_MS: numberWithDefault(3600000), // 1 hour
  CHANNEL_ARCHIVE_RATE_LIMIT_MAX_REQUESTS: numberWithDefault(10),
  CHANNEL_READ_RATE_LIMIT_WINDOW_MS: numberWithDefault(60000), // 1 minute
  CHANNEL_READ_RATE_LIMIT_MAX_REQUESTS: numberWithDefault(100),

  // Rate Limiting - Events
  EVENT_SUBSCRIPTION_RATE_LIMIT_WINDOW_MS: numberWithDefault(3600000), // 1 hour
  EVENT_SUBSCRIPTION_RATE_LIMIT_MAX_REQUESTS: numberWithDefault(1),
  EVENT_TYPING_RATE_LIMIT_WINDOW_MS: numberWithDefault(60000), // 1 minute
  EVENT_TYPING_RATE_LIMIT_MAX_REQUESTS: numberWithDefault(30),
  EVENT_PRESENCE_RATE_LIMIT_WINDOW_MS: numberWithDefault(60000), // 1 minute
  EVENT_PRESENCE_RATE_LIMIT_MAX_REQUESTS: numberWithDefault(60),

  // Rate Limiting - Messages
  MESSAGE_CREATE_RATE_LIMIT_WINDOW_MS: numberWithDefault(60000), // 1 minute
  MESSAGE_CREATE_RATE_LIMIT_MAX_REQUESTS: numberWithDefault(30),
  MESSAGE_UPDATE_RATE_LIMIT_WINDOW_MS: numberWithDefault(60000), // 1 minute
  MESSAGE_UPDATE_RATE_LIMIT_MAX_REQUESTS: numberWithDefault(30),
  MESSAGE_DELETE_RATE_LIMIT_WINDOW_MS: numberWithDefault(60000), // 1 minute
  MESSAGE_DELETE_RATE_LIMIT_MAX_REQUESTS: numberWithDefault(20),
  MESSAGE_REACTIONS_RATE_LIMIT_WINDOW_MS: numberWithDefault(60000), // 1 minute
  MESSAGE_REACTIONS_RATE_LIMIT_MAX_REQUESTS: numberWithDefault(60),
  MESSAGE_SEARCH_RATE_LIMIT_WINDOW_MS: numberWithDefault(60000), // 1 minute
  MESSAGE_SEARCH_RATE_LIMIT_MAX_REQUESTS: numberWithDefault(30),
});

export type EnvSchema = z.infer<typeof envSchema>; 