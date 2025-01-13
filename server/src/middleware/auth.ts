import { Request, Response, NextFunction } from 'express';
import { auth, UnauthorizedError as Auth0UnauthorizedError } from 'express-oauth2-jwt-bearer';
import { config } from '@/config';
import { UnauthorizedError } from '@/errors';
import { AuthenticatedRequest } from '@/types/express';

// Helper function to get user ID from request
export const getUserId = (req: AuthenticatedRequest): string => {
  if (!req.user?.id) {
    console.error('[Auth] getUserId: No user ID found in request');
    throw new UnauthorizedError('User not authenticated');
  }
  return req.user.id;
};

// Log Auth0 configuration on startup
console.log('[Auth] Auth0 Configuration:', {
  issuerBaseURL: `https://${config.auth0.domain}`,
  audience: config.auth0.audience,
  domain: config.auth0.domain
});

// Initialize Auth0 middleware with debug logging
const authMiddlewareInstance = auth({
  issuerBaseURL: `https://${config.auth0.domain}`,
  audience: config.auth0.audience
});

// Wrap the auth middleware to add logging
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  console.log('[Auth] Incoming request headers:', {
    authorization: req.headers.authorization ? 'Bearer [token]' : 'No token',
    'content-type': req.headers['content-type']
  });

  authMiddlewareInstance(req, res, (err: Auth0UnauthorizedError | undefined) => {
    if (err) {
      console.error('[Auth] Authentication error:', {
        name: err.name,
        message: err.message,
        status: err.status,
        statusCode: err.statusCode
      });
    } else {
      console.log('[Auth] Authentication successful');
    }
    next(err);
  });
};

// Extract user info from Auth0 token with detailed logging
export const extractUser = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  console.log('[Auth] Extracting user info from token');
  try {
    const payload = req.auth?.payload;
    console.log('[Auth] Token payload:', JSON.stringify(payload, null, 2));
    
    if (!payload || typeof payload !== 'object') {
      console.error('[Auth] No payload or invalid payload type found in token');
      throw new UnauthorizedError('No user info found in token');
    }

    const sub = payload.sub;
    const email = payload.email;
    
    console.log('[Auth] Extracted user info:', { sub, email });

    if (!sub || typeof sub !== 'string' || !email || typeof email !== 'string') {
      console.error('[Auth] Invalid user info in token:', { sub, email });
      throw new UnauthorizedError('Invalid user info in token');
    }

    // Extract optional name and picture
    const name = payload.name && typeof payload.name === 'string' ? payload.name : undefined;
    const picture = payload.picture && typeof payload.picture === 'string' ? payload.picture : undefined;

    // Set user info on request
    req.user = {
      id: sub.split('|')[1],
      sub,
      email,
      name,
      picture
    };

    console.log('[Auth] Successfully set user info:', req.user);
    next();
  } catch (error) {
    console.error('[Auth] Error in extractUser:', error);
    next(error);
  }
};

// Combine auth middlewares
export const authMiddleware = [authenticate, extractUser]; 