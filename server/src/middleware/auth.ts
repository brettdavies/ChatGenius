import { Request, Response, NextFunction } from 'express';
import { auth, UnauthorizedError as Auth0UnauthorizedError } from 'express-oauth2-jwt-bearer';
import { config } from '@/config';
import { AuthService } from '@/services/auth-service';
import { AuthenticatedRequest } from '@/types/express';

const authService = AuthService.getInstance();

// Initialize Auth0 middleware
const authMiddlewareInstance = auth({
  issuerBaseURL: `https://${config.auth0.domain}`,
  audience: config.auth0.audience
});

// Development mode middleware that skips Auth0 verification
const developmentAuth = (_req: Request, _res: Response, next: NextFunction) => {
  next();
};

// Production auth middleware with logging
const productionAuth = (req: Request, res: Response, next: NextFunction) => {
  console.log('[Auth] Authenticating request');
  authMiddlewareInstance(req, res, (err: Auth0UnauthorizedError | undefined) => {
    if (err) {
      console.error('[Auth] Authentication error:', err);
    }
    next(err);
  });
};

// Choose auth middleware based on environment
export const authenticate = config.nodeEnv === 'development' ? developmentAuth : productionAuth;

// Extract user info middleware
export const extractUser = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (config.nodeEnv === 'development') {
      // In development, use the dev user from AuthService
      req.user = authService.getCurrentUser(req);
      return next();
    }

    // In production, extract user from Auth0 token
    const payload = req.auth?.payload;
    if (!payload || typeof payload !== 'object') {
      return next();
    }

    const sub = payload.sub;
    if (!sub || typeof sub !== 'string') {
      return next();
    }

    req.user = {
      id: sub.split('|')[1],
      sub,
      email: payload.email as string,
      name: payload.name as string,
      picture: payload.picture as string
    };

    next();
  } catch (error) {
    console.error('[Auth] Error in extractUser:', error);
    next(error);
  }
};

// Combine auth middlewares
export const authMiddleware = [authenticate, extractUser]; 