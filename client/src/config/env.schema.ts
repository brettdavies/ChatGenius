import { z } from 'zod';

// Helper function to create a string parser with default value
const stringWithDefault = (defaultValue: string) => 
  z.string().default(defaultValue);

// Helper function to create a number parser with default value
const numberWithDefault = (defaultValue: number) => 
  z.preprocess(
    (val) => Number(val) || defaultValue,
    z.number().positive()
  );

// Helper function to create a boolean parser with default value
const booleanWithDefault = (defaultValue: boolean) => 
  z.preprocess(
    (val) => val === 'true' ? true : val === 'false' ? false : defaultValue,
    z.boolean()
  );

// Environment schema definition
export const envSchema = z.object({
  // Required variables
  VITE_NODE_ENV: z.enum(['development', 'test', 'production']),
  VITE_API_URL: z.string().min(1),

  // Optional variables with defaults
  VITE_APP_NAME: stringWithDefault('ChatGenius'),
  VITE_APP_DESCRIPTION: stringWithDefault('Real-time chat application'),
  VITE_APP_VERSION: stringWithDefault('1.0.0'),
  
  // API Configuration
  VITE_API_TIMEOUT: numberWithDefault(30000),
  VITE_API_RETRY_ATTEMPTS: numberWithDefault(3),
  
  // Feature Flags
  VITE_ENABLE_2FA: booleanWithDefault(true),
  VITE_ENABLE_FILE_UPLOAD: booleanWithDefault(false),
  VITE_ENABLE_RICH_TEXT: booleanWithDefault(true),
  
  // UI Configuration
  VITE_MAX_MESSAGE_LENGTH: numberWithDefault(4000),
  VITE_MAX_CHANNEL_NAME_LENGTH: numberWithDefault(80),
  VITE_MAX_USERNAME_LENGTH: numberWithDefault(50),
  
  // WebSocket Configuration
  VITE_WS_RECONNECT_INTERVAL: numberWithDefault(2000),
  VITE_WS_MAX_RECONNECT_ATTEMPTS: numberWithDefault(5),
  
  // Cache Configuration
  VITE_CACHE_TTL: numberWithDefault(3600), // 1 hour in seconds
  VITE_MAX_CACHED_MESSAGES: numberWithDefault(1000),
});

export type EnvSchema = z.infer<typeof envSchema>; 