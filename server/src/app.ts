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
import { SessionCleanupService } from './services/session-cleanup.js';
import { customFormats } from './openapi/formats.js';

// Route imports
import authRoutes from './routes/auth.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: ENV.CORS_ORIGIN,
  credentials: true
}));

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting (disabled in test mode)
if (ENV.NODE_ENV !== 'test') {
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
    sameSite: 'strict',
    domain: ENV.AUTH.COOKIE_DOMAIN,
    maxAge: ENV.AUTH.SESSION_MAX_AGE
  }
});

app.use(sessionMiddleware);

// Initialize session cleanup (not in test mode)
if (ENV.NODE_ENV !== 'test') {
  const sessionCleanup = new SessionCleanupService(store);
  sessionCleanup.start();
  
  // Cleanup on graceful shutdown
  process.on('SIGTERM', () => {
    sessionCleanup.stop();
  });
}

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// OpenAPI documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiConfig));

// Health check endpoint
app.get('/health', (_req, res) => {
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
        bearerAuth: async (req) => Boolean(req.user)
      }
    },
    formats: customFormats
  })
);

// Routes
app.use('/api/auth', authRoutes);

// Error handling
app.use((err: Error & { status?: number, errors?: unknown[] }, _req: express.Request, res: express.Response) => {
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
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error'
  });
});

export default app; 