import { RequestHandler } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { AUTH_MESSAGES } from '../constants/auth.constants.js';
import { ENV } from '../config/env.js';

// Rate limiting configuration
export const rateLimiters = {
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: ENV.NODE_ENV === 'test' ? 1000 : 5, // Higher limit for tests
    message: { message: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  }),
  api: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: ENV.NODE_ENV === 'test' ? 1000 : 100, // Higher limit for tests
    message: { message: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  }),
};

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
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