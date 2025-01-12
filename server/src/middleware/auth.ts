import { Request, Response, NextFunction } from 'express';
import { auth, AuthResult } from 'express-oauth2-jwt-bearer';
import { User } from '../types/user';

// Extend Express Request to include auth and user
declare global {
  namespace Express {
    interface Request {
      auth?: AuthResult;
      user?: User;
    }
  }
}

// Create middleware using Auth0 configuration
export const authMiddleware = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: 'RS256'
});

// Attach user information to request
export const attachUser = (req: Request, _res: Response, next: NextFunction) => {
  if (req.auth?.payload) {
    const { sub, email, name, picture } = req.auth.payload as { sub: string; email: string; name: string; picture?: string };
    req.user = {
      id: sub,
      email,
      name,
      picture,
      created_at: new Date(),
      updated_at: new Date()
    };
  }
  next();
};

// Type guard to check if request is authenticated
export const isAuthenticated = (req: Request): req is Request & { user: User } => {
  return !!req.auth?.payload && !!req.user;
};

// Helper to get user ID from request
export const getUserId = (req: Request): string => {
  if (!isAuthenticated(req)) {
    throw new Error('User is not authenticated');
  }
  return req.user.id;
}; 