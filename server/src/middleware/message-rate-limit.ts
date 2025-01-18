import rateLimit from 'express-rate-limit';
import { ENV } from '../config/env.js';

// Rate limit for creating messages
export const messageCreateLimiter = rateLimit({
  windowMs: ENV.RATE_LIMIT.MESSAGES.CREATE.WINDOW_MS,
  max: ENV.RATE_LIMIT.MESSAGES.CREATE.MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many messages created from this IP, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// Rate limit for updating messages
export const messageUpdateLimiter = rateLimit({
  windowMs: ENV.RATE_LIMIT.MESSAGES.UPDATE.WINDOW_MS,
  max: ENV.RATE_LIMIT.MESSAGES.UPDATE.MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many message updates from this IP, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// Rate limit for deleting messages
export const messageDeleteLimiter = rateLimit({
  windowMs: ENV.RATE_LIMIT.MESSAGES.DELETE.WINDOW_MS,
  max: ENV.RATE_LIMIT.MESSAGES.DELETE.MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many message deletions from this IP, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// Rate limit for message reactions
export const messageReactionLimiter = rateLimit({
  windowMs: ENV.RATE_LIMIT.MESSAGES.REACTIONS.WINDOW_MS,
  max: ENV.RATE_LIMIT.MESSAGES.REACTIONS.MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many reactions from this IP, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// Rate limit for message search
export const messageSearchLimiter = rateLimit({
  windowMs: ENV.RATE_LIMIT.MESSAGES.SEARCH.WINDOW_MS,
  max: ENV.RATE_LIMIT.MESSAGES.SEARCH.MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many search requests from this IP, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  }
}); 