import { Request, Response, NextFunction } from 'express';
import { UserError } from '../services/user-service.js';
import * as emoji from 'node-emoji';
import { validationResult } from 'express-validator';
import { sendError } from '../utils/response.utils.js';

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
      if (!content.trim()) {
        throw new UserError('INVALID_CONTENT', 'Message content cannot be empty');
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
      if (!content.trim()) {
        throw new UserError('INVALID_CONTENT', 'Message content cannot be empty');
      }
      if (content.length > 4000) {
        throw new UserError('CONTENT_TOO_LONG', 'Message content cannot exceed 4000 characters');
      }
      return next();
    }

    // Message reaction validation
    if (path.match(/^\/[^/]+\/reactions$/) && method === 'POST') {
      const { emoji: emojiInput } = req.body;
      if (!emojiInput) {
        throw new UserError('MISSING_EMOJI', 'Emoji is required');
      }
      if (!emoji.has(emojiInput)) {
        throw new UserError('INVALID_EMOJI', 'Invalid emoji format');
      }
      return next();
    }

    // Search validation
    if (path === '/search' && method === 'GET') {
      const { query, limit, offset } = req.query;
      if (!query || !query.toString().trim()) {
        throw new UserError('INVALID_QUERY', 'Search query cannot be empty');
      }
      if (limit) {
        const limitNum = parseInt(limit.toString(), 10);
        if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
          throw new UserError('INVALID_LIMIT', 'Limit must be between 1 and 100');
        }
      }
      if (offset) {
        const offsetNum = parseInt(offset.toString(), 10);
        if (isNaN(offsetNum) || offsetNum < 0) {
          throw new UserError('INVALID_OFFSET', 'Offset cannot be negative');
        }
      }
      return next();
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = errors.array()[0];
      sendError(res, error.msg, 'VALIDATION_ERROR', [{
        message: error.msg,
        code: 'VALIDATION_ERROR',
        path: req.path
      }], 400);
      return;
    }

    // Validate emoji if present in request body
    if (req.body.emoji) {
      const emojiStr = req.body.emoji;
      if (!emoji.find(emojiStr)) {
        sendError(res, 'Invalid emoji', 'INVALID_EMOJI', [{
          message: 'Invalid emoji',
          code: 'INVALID_EMOJI',
          path: req.path
        }], 400);
        return;
      }
    }

    next();
  } catch (error) {
    if (error instanceof UserError) {
      sendError(res, error.message, error.code, [{
        message: error.message,
        code: error.code,
        path: req.path
      }], 400);
    } else {
      next(error);
    }
  }
} 