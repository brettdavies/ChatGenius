import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError as Auth0UnauthorizedError } from 'express-oauth2-jwt-bearer';
import { UnauthorizedError } from '@/errors';

export interface ApiError extends Error {
  status?: number;
  code?: string;
}

export function errorHandler(
  error: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('Error:', {
    name: error.name,
    message: error.message,
    stack: error.stack
  });

  // Handle Auth0 errors
  if (error instanceof Auth0UnauthorizedError) {
    return res.status(401).json({
      error: 'unauthorized',
      message: 'Invalid or expired token',
      code: error.code
    });
  }

  // Handle our custom unauthorized errors
  if (error instanceof UnauthorizedError) {
    return res.status(401).json({
      error: 'unauthorized',
      message: error.message
    });
  }

  // Handle token expiration
  if (error.message?.includes('jwt expired')) {
    return res.status(401).json({
      error: 'token_expired',
      message: 'Your session has expired. Please log in again.'
    });
  }

  // Handle invalid token format
  if (error.message?.includes('jwt malformed')) {
    return res.status(401).json({
      error: 'invalid_token',
      message: 'Invalid authentication token format'
    });
  }

  // Handle missing token
  if (error.message?.includes('No authorization token was found')) {
    return res.status(401).json({
      error: 'missing_token',
      message: 'No authentication token provided'
    });
  }

  // Handle invalid signature
  if (error.message?.includes('invalid signature')) {
    return res.status(401).json({
      error: 'invalid_signature',
      message: 'Invalid token signature'
    });
  }

  // Default error response
  const status = error.status || 500;
  const message = status === 500 ? 'Internal server error' : error.message;

  return res.status(status).json({
    error: error.name?.toLowerCase() || 'error',
    message,
    code: error.code
  });
} 