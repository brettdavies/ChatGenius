import { Request, Response, NextFunction } from 'express';
import { jest } from '@jest/globals';

/**
 * Mock Auth0 middleware for testing
 */
export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
  if (req.headers['x-mock-auth'] === 'fail') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.user = { id: 'test-user-id' };
  next();
};

// Mock the auth0-express-jwt module
jest.mock('express-oauth2-jwt-bearer', () => ({
  auth: () => checkJwt
})); 