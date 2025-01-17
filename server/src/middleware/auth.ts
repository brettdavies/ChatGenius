import { Request, Response, NextFunction } from 'express';
import { UserError } from '../services/user-service.js';

export function isAuthenticated(req: Request, res: Response, next: NextFunction): void {
  if (!req.isAuthenticated()) {
    throw new UserError('UNAUTHORIZED', 'Authentication required');
  }
  next();
} 