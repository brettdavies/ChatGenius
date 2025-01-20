import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user-service.js';
import { sendError } from '../utils/response.utils.js';

// Add Passport session type
declare module 'express-session' {
  interface SessionData {
    passport: {
      user: string;
    };
  }
}

const userService = new UserService();


export function validateSession(req: Request, res: Response, next: NextFunction) {
  if (!req.session || !req.session.passport || !req.session.passport.user) {
    return sendError(res, 'Session expired or invalid', 'INVALID_SESSION', [{
      message: 'Session expired or invalid',
      code: 'INVALID_SESSION',
      path: req.path
    }], 401);
  }

  // Fetch fresh user data
  userService.getUserById(req.session.passport.user)
    .then(user => {
      if (!user) {
        return sendError(res, 'User not found', 'USER_NOT_FOUND', [{
          message: 'User not found',
          code: 'USER_NOT_FOUND',
          path: req.path
        }], 401);
      }
      req.user = user;
      next();
    })
    .catch(error => {
      console.error('Error fetching user:', error);
      sendError(res, 'Failed to validate session', 'SESSION_VALIDATION_ERROR', [{
        message: 'Failed to validate session',
        code: 'SESSION_VALIDATION_ERROR',
        path: req.path
      }], 500);
    });
}

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  
  sendError(res, 'Authentication required', 'AUTH_REQUIRED', [{
    message: 'Authentication required',
    code: 'AUTH_REQUIRED',
    path: req.path
  }], 401);
} 