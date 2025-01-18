import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user-service.js';

const userService = new UserService();

// Session age thresholds (in milliseconds)
const SESSION_REFRESH_THRESHOLD = 15 * 60 * 1000; // 15 minutes
const SESSION_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

export async function validateSession(req: Request, res: Response, next: NextFunction) {
  try {
    // Check if session exists
    if (!req.session || !req.isAuthenticated()) {
      console.log('[Auth] No valid session found');
      return res.status(401).json({
        message: 'Unauthorized',
        errors: [{
          message: 'Session expired or invalid',
          code: 'SESSION_INVALID',
          path: req.path
        }]
      });
    }

    // Get session creation time
    const sessionCreatedAt = new Date(req.session.createdAt || Date.now());
    const sessionAge = Date.now() - sessionCreatedAt.getTime();

    // If session is too old, force re-login
    if (sessionAge > SESSION_MAX_AGE) {
      console.log('[Auth] Session expired');
      req.logout((err) => {
        if (err) console.error('[Auth] Logout error:', err);
      });
      return res.status(401).json({
        message: 'Session expired',
        errors: [{
          message: 'Please login again',
          code: 'SESSION_EXPIRED',
          path: req.path
        }]
      });
    }

    // If session is nearing expiry, refresh it
    if (sessionAge > SESSION_REFRESH_THRESHOLD) {
      console.log('[Auth] Refreshing session');
      req.session.createdAt = new Date();
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    // Validate and refresh user data
    if (req.user) {
      const user = await userService.getUserById(req.user.id);
      if (!user) {
        console.log('[Auth] User not found');
        req.logout((err) => {
          if (err) console.error('[Auth] Logout error:', err);
        });
        return res.status(401).json({
          message: 'User not found',
          errors: [{
            message: 'User account may have been deleted',
            code: 'USER_NOT_FOUND',
            path: req.path
          }]
        });
      }
      // Update session with latest user data
      req.user = user;
    }

    next();
  } catch (error) {
    console.error('[Auth] Session validation error:', error);
    res.status(500).json({
      message: 'Internal server error',
      errors: [{
        message: 'Failed to validate session',
        code: 'AUTH_ERROR',
        path: req.path
      }]
    });
  }
}

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  
  res.status(401).json({
    message: 'Unauthorized',
    errors: [{
      message: 'Authentication required',
      code: 'AUTH_REQUIRED',
      path: req.path
    }]
  });
} 