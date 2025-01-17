import { Request, Response, NextFunction } from 'express';
import { UserError } from '../services/user-service.js';

export function validateRequest(req: Request, res: Response, next: NextFunction): void {
  const path = req.path;
  const method = req.method;

  try {
    // Registration validation
    if (path === '/register' && method === 'POST') {
      const { email, password, username } = req.body;
      if (!email || !password || !username) {
        throw new UserError('MISSING_CREDENTIALS', 'Email, password, and username are required');
      }
    }

    // Login validation
    if (path === '/login' && method === 'POST') {
      const { email, password } = req.body;
      if (!email || !password) {
        throw new UserError('MISSING_CREDENTIALS', 'Email and password are required');
      }
    }

    // Profile update validation
    if (path === '/me' && method === 'PUT') {
      const { email, password, username } = req.body;
      if (!email && !password && !username) {
        throw new UserError('INVALID_UPDATE', 'At least one field must be provided for update');
      }
    }

    // 2FA validation
    if (path.startsWith('/2fa/')) {
      if (path === '/2fa/validate' && method === 'POST') {
        const { email, token } = req.body;
        if (!email || !token) {
          throw new UserError('MISSING_CREDENTIALS', 'Email and token are required');
        }
      }

      if (path === '/2fa/verify' && method === 'POST') {
        const { token } = req.body;
        if (!token) {
          throw new UserError('MISSING_TOKEN', 'Verification token is required');
        }
      }

      if (path === '/2fa/disable' && method === 'POST') {
        const { password } = req.body;
        if (!password) {
          throw new UserError('MISSING_PASSWORD', 'Password is required to disable 2FA');
        }
      }
    }

    next();
  } catch (error) {
    if (error instanceof UserError) {
      res.status(400).json({ message: error.message, code: error.code });
    } else {
      next(error);
    }
  }
} 