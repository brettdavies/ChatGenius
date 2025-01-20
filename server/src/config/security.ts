import { RequestHandler } from 'express';
import helmet from 'helmet';
import { ENV } from './env.js';

// CORS configuration
const corsOptions = {
  origin: ENV.CORS_ORIGIN,
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
  corsMiddleware
]; 