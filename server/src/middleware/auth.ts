import { auth } from 'express-oauth2-jwt-bearer';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

// Auth0 JWT validation middleware
export const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_URL,
});

// Error handling middleware for authentication
export const handleAuthError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ error: 'Invalid token or no token provided' });
    return;
  }
  next(err);
};

// SSE authentication middleware
export const sseAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }
    
    // Validate token using checkJwt
    await new Promise((resolve, reject) => {
      checkJwt(req, res, (err) => {
        if (err) reject(err);
        resolve(true);
      });
    });
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}; 