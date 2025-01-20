import express from 'express';
import passport from './auth/passport.js';
import session, { MemoryStore } from 'express-session';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { ENV } from './config/env.js';
import swaggerUi from 'swagger-ui-express';
import { middleware as openApiValidator } from 'express-openapi-validator';
import openApiConfig from './openapi/index.js';
import { cleanupExpiredSessions } from './services/session-cleanup.js';
import { customFormats } from './openapi/formats.js';

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
const store = new MemoryStore();

// Session configuration
const sessionMiddleware = session({
  store,
  secret: ENV.AUTH.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: 'sessionId',
  cookie: {
    secure: ENV.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    domain: ENV.AUTH.COOKIE_DOMAIN,
    maxAge: ENV.AUTH.SESSION_MAX_AGE
  }
});

app.use(sessionMiddleware);

// Initialize session cleanup (not in test mode)
if (ENV.NODE_ENV !== 'test') {
  // Run cleanup every hour
  const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour
  const cleanup = () => {
    cleanupExpiredSessions(store, ENV.AUTH.SESSION_MAX_AGE)
      .catch(err => console.error('Session cleanup failed:', err));
  };
  
  const cleanupInterval = setInterval(cleanup, CLEANUP_INTERVAL);
  cleanup(); // Run initial cleanup
  
  // Cleanup on graceful shutdown
  process.on('SIGTERM', () => {
    clearInterval(cleanupInterval);
  });
}

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// OpenAPI documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiConfig));

// Health check endpoint
app.get('/api/health', (_req: express.Request, res: express.Response) => {
  console.log('[DEBUG] Health check endpoint called');
  res.status(200).json({ status: 'ok' });
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

// Error handling
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // OpenAPI validation errors
  if (err.status === 400 && err.errors) {
    return res.status(400).json({
      message: 'Invalid request data',
      errors: err.errors
    });
  }

  // JWT authentication errors
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      message: 'Invalid token'
    });
  }

  // Default error
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error'
  });
});

// Add server startup code
const PORT = ENV.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
export const viteNodeApp = app; 