import { RequestHandler } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { AUTH_MESSAGES } from '@constants/auth.constants';

// Rate limiter configuration
const rateLimiters = {
  api: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { message: AUTH_MESSAGES.TOO_MANY_REQUESTS }
  }),
  auth: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // limit each IP to 10 attempts per minute
    message: { message: AUTH_MESSAGES.TOO_MANY_REQUESTS }
  })
};

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// CORS middleware
const corsMiddleware: RequestHandler = (_req, res, next) => {
  res.header('Access-Control-Allow-Origin', corsOptions.origin);
  res.header('Access-Control-Allow-Methods', corsOptions.methods.join(','));
  res.header('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(','));
  res.header('Access-Control-Allow-Credentials', String(corsOptions.credentials));
  next();
};

// Security middleware chain
export const securityMiddleware = [
  helmet(),
  corsMiddleware,
  rateLimiters.api
];

export { rateLimiters }; 