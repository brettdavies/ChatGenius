import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { Server } from 'http';
import path from 'path';

// Load environment variables based on environment
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
}

// Process database URL template
const processEnvTemplate = (template: string, env: NodeJS.ProcessEnv, processed = new Set<string>()): string => {
  return template.replace(/\${([^}]+)}/g, (match, key) => {
    if (processed.has(key)) {
      return env[key] || '';
    }
    processed.add(key);
    const value = env[key] || '';
    const processedValue = value.includes('${') ? processEnvTemplate(value, env, processed) : value;
    env[key] = processedValue;
    console.log(`Replacing ${match} with ${key.includes('PASSWORD') ? '[HIDDEN]' : processedValue}`);
    return processedValue;
  });
};

// Process environment variables that contain templates
['DATABASE_URL', 'DATABASE_PUBLIC_URL', 'PGUSER', 'PGPASSWORD', 'PGDATABASE'].forEach(key => {
  if (process.env[key]?.includes('${')) {
    const originalValue = process.env[key];
    process.env[key] = processEnvTemplate(originalValue!, process.env);
    if (key.includes('URL')) {
      console.log(`Processed ${key}:`, process.env[key]?.replace(/:[^:@]+@/, ':[HIDDEN]@'));
    }
  }
});

// Set the appropriate DATABASE_URL based on environment
if (process.env.NODE_ENV === 'production') {
  // In production (Railway), use the private domain URL
  if (!process.env.DATABASE_URL?.includes('railway.internal')) {
    console.warn('[WARNING] Production environment detected but not using internal Railway URL');
  }
} else {
  // In development, use the public proxy URL
  if (process.env.DATABASE_PUBLIC_URL) {
    console.log('[CONFIG] Using public proxy URL for database connection');
    process.env.DATABASE_URL = process.env.DATABASE_PUBLIC_URL;
  }
}

// Debug environment variables
console.log('Environment Variables:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  DATABASE_URL: process.env.DATABASE_URL ? '[HIDDEN]' : undefined,
  IS_RAILWAY: process.env.RAILWAY_ENVIRONMENT === 'production'
});

// Initialize Express app
const app = express();
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Global variables
let server: Server | undefined;
let pool: Pool | undefined;

async function startServer() {
  console.log('=== SERVER STARTUP SEQUENCE INITIATED ===');
  
  // Log configuration
  console.log('[CONFIG] Environment:', process.env.NODE_ENV);
  console.log('[CONFIG] Port:', process.env.PORT || 3001);
  console.log('[CONFIG] CORS Origin:', process.env.CORS_ORIGIN);

  try {
    // Initialize database connection
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('[DB] Connected successfully');

    // Start the server
    const PORT = process.env.PORT || 3001;
    server = app.listen(PORT, () => {
      console.log(`[SERVER] Server is running on port ${PORT}`);
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error('[SERVER] Server error:', error);
    });

  } catch (error) {
    console.error('[SERVER] Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
async function shutdown() {
  console.log('\n=== SERVER SHUTDOWN SEQUENCE INITIATED ===');
  
  if (server) {
    console.log('[SERVER] Closing HTTP server...');
    server.close(() => {
      console.log('[SERVER] HTTP server closed');
    });
  }

  if (pool) {
    console.log('[DB] Closing database pool...');
    await pool.end();
    console.log('[DB] Database pool closed');
  }

  console.log('[SERVER] Shutdown complete');
  process.exit(0);
}

// Handle process signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start the server
startServer();

export default app; 