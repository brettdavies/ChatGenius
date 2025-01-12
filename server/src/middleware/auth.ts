import { Request, Response, NextFunction } from 'express';
import { auth, AuthResult } from 'express-oauth2-jwt-bearer';
import { User } from '../types/user';
import { logger } from '../utils/logger';

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
export const attachUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.auth?.payload) {
      return res.status(401).json({ error: 'No authentication payload found' });
    }

    const { sub, email, name, picture } = req.auth.payload as { sub: string; email: string; name: string; picture?: string };
    
    if (!sub) {
      return res.status(401).json({ error: 'No user ID found in token' });
    }

    req.user = {
      id: sub,
      email: email || '',
      name: name || '',
      picture,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    next();
  } catch (error) {
    logger.error('Error attaching user:', error);
    res.status(500).json({ error: 'Failed to process authentication' });
  }
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