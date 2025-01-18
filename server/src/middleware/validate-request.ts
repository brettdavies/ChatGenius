import { Request, Response, NextFunction } from 'express';
import { UserError } from '../services/user-service.js';

export function validateRequest(req: Request, res: Response, next: NextFunction): void {
  const path = req.path;
  const method = req.method;

  try {
    // 2FA setup validation
    if (path === '/2fa/setup' && method === 'POST') {
      // No request body validation needed for setup
      return next();
    }

    // 2FA verification validation
    if (path === '/2fa/verify' && method === 'POST') {
      const { token } = req.body;
      if (!token) {
        throw new UserError('MISSING_TOKEN', 'Token is required');
      }
      if (!/^[0-9]{6}$/.test(token)) {
        throw new UserError('INVALID_TOKEN', 'Token must be 6 digits');
      }
      return next();
    }

    // Message validation
    if (path === '/' && method === 'POST') {
      const { channelId, content } = req.body;
      if (!channelId || !content) {
        throw new UserError('MISSING_FIELDS', 'Channel ID and content are required');
      }
      if (content.length > 4000) {
        throw new UserError('CONTENT_TOO_LONG', 'Message content cannot exceed 4000 characters');
      }
      return next();
    }

    // Message update validation
    if (path.match(/^\/[^/]+$/) && method === 'PUT') {
      const { content } = req.body;
      if (!content) {
        throw new UserError('MISSING_CONTENT', 'Message content is required');
      }
      if (content.length > 4000) {
        throw new UserError('CONTENT_TOO_LONG', 'Message content cannot exceed 4000 characters');
      }
      return next();
    }

    // Message reaction validation
    if (path.match(/^\/[^/]+\/reactions$/) && method === 'POST') {
      const { emoji } = req.body;
      if (!emoji) {
        throw new UserError('MISSING_EMOJI', 'Emoji is required');
      }
      if (!emoji.match(/^[\u{1F300}-\u{1F9FF}]$/u)) {
        throw new UserError('INVALID_EMOJI', 'Invalid emoji format');
      }
      return next();
    }

    // Search validation
    if (path === '/search' && method === 'GET') {
      const { query } = req.query;
      if (!query) {
        throw new UserError('MISSING_QUERY', 'Search query is required');
      }
      return next();
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