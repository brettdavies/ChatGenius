import express from 'express';
import passport from './auth/passport.js';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { ENV } from './config/env.js';
import swaggerUi from 'swagger-ui-express';
import { middleware as openApiValidator } from 'express-openapi-validator';
import openApiConfig from './openapi/index.js';
import { customFormats } from './openapi/formats.js';
import { pool, connectWithRetry } from '@config/database.js';
import { sendResponse, sendError } from './utils/response.utils.js';

// Route imports
import authRoutes from './routes/auth.js';
import channelRoutes from './routes/channels.js';
import eventRoutes from './routes/events.js';
import messageRoutes from './routes/messages.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: ENV.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add debug logging only in development
if (ENV.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(`[DEBUG] ${req.method} ${req.path}`);
    next();
  });
}

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting (disabled in development and test modes)
if (ENV.NODE_ENV === 'production') {
  app.use('/api/auth', rateLimit({
    windowMs: ENV.RATE_LIMIT.AUTH.WINDOW_MS,
    max: ENV.RATE_LIMIT.AUTH.MAX_REQUESTS
  }));
  app.use('/api', rateLimit({
    windowMs: ENV.RATE_LIMIT.API.WINDOW_MS,
    max: ENV.RATE_LIMIT.API.MAX_REQUESTS
  }));
}

// Session store setup
const PostgresqlStore = pgSession(session);
const sessionStore = new PostgresqlStore({
  pool,
  tableName: 'sessions',
  createTableIfMissing: true,
  pruneSessionInterval: ENV.AUTH.SESSION_MAX_AGE / (1000 * 60) // Convert from ms to minutes
});

// Session configuration
const sessionMiddleware = session({
  store: sessionStore,
  secret: ENV.AUTH.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: 'sessionId',
  cookie: {
    secure: false,
    httpOnly: true,
    sameSite: 'lax',
    domain: undefined,
    maxAge: ENV.AUTH.SESSION_MAX_AGE
  }
});

app.use(sessionMiddleware);

// Initialize session cleanup (not in test mode)
if (ENV.NODE_ENV !== 'test') {
  // Cleanup on graceful shutdown
  process.on('SIGTERM', () => {
    sessionStore.close();
  });
}

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// OpenAPI documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiConfig));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  sendResponse(res, 'Service is healthy', 'HEALTH_CHECK_OK', {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// OpenAPI validation
app.use(
  openApiValidator({
    apiSpec: openApiConfig,
    validateRequests: true,
    validateResponses: true,
    validateSecurity: {
      handlers: {
        session: async (req) => {
          // Check if user is authenticated via session
          if (req.isAuthenticated()) {
            return true;
          }
          // For login/register endpoints, allow unauthenticated access
          if (req.path.startsWith('/api/auth/login') || req.path.startsWith('/api/auth/register')) {
            return true;
          }
          return false;
        }
      }
    },
    formats: customFormats
  })
);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/messages', messageRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  
  if (err instanceof SyntaxError && 'status' in err && err.status === 400) {
    return sendError(res, 'Invalid JSON payload', 'INVALID_JSON', [{
      message: 'Invalid JSON payload',
      code: 'INVALID_JSON',
      path: req.path
    }], 400);
  }

  if (err instanceof Error && err.name === 'UnauthorizedError') {
    return sendError(res, 'Invalid or expired token', 'INVALID_TOKEN', [{
      message: 'Invalid or expired token',
      code: 'INVALID_TOKEN',
      path: req.path
    }], 401);
  }

  sendError(res, 'Internal server error', 'INTERNAL_SERVER_ERROR', [{
    message: 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR',
    path: req.path
  }], 500);
});

// Add server startup code
const PORT = ENV.PORT || 3000;

// Wait for database connection before starting server
const startServer = async () => {
  try {
    await connectWithRetry();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
export const viteNodeApp = app; 