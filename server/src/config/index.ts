import dotenv from 'dotenv';

// Load environment variables from .env.local
console.log('[Config] Loading environment variables from .env.local');
dotenv.config({ path: '.env.local' });

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  isRailway: process.env.RAILWAY_ENVIRONMENT === 'true',
  
  // Database configuration
  db: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/chatgenius'
  },

  // Auth0 configuration
  auth0: {
    domain: process.env.AUTH0_DOMAIN || '',
    audience: process.env.AUTH0_AUDIENCE || '',
    clientId: process.env.AUTH0_CLIENT_ID || '',
    clientSecret: process.env.AUTH0_CLIENT_SECRET || ''
  }
} as const;

// Log configuration (excluding sensitive values)
console.log('[Config] Server configuration:', {
  nodeEnv: config.nodeEnv,
  port: config.port,
  corsOrigin: config.corsOrigin,
  isRailway: config.isRailway,
  auth0: {
    domain: config.auth0.domain,
    audience: config.auth0.audience,
    // Exclude clientId and clientSecret for security
    hasClientId: !!config.auth0.clientId,
    hasClientSecret: !!config.auth0.clientSecret
  }
});

// Validate required environment variables
const requiredEnvVars = [
  ['AUTH0_DOMAIN', config.auth0.domain],
  ['AUTH0_AUDIENCE', config.auth0.audience],
  ['AUTH0_CLIENT_ID', config.auth0.clientId],
  ['AUTH0_CLIENT_SECRET', config.auth0.clientSecret],
  ['DATABASE_URL', config.db.url]
];

for (const [name, value] of requiredEnvVars) {
  if (!value) {
    console.error(`[Config] Missing required environment variable: ${name}`);
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

console.log('[Config] All required environment variables are present');

export { config }; 