import rateLimit from 'express-rate-limit';
import { ENV } from '../config/env.js';

/**
 * Rate limit middleware for channel creation
 */
export const channelCreateLimiter = rateLimit({
  windowMs: ENV.RATE_LIMIT.CHANNELS.CREATE.WINDOW_MS,
  max: ENV.RATE_LIMIT.CHANNELS.CREATE.MAX_REQUESTS,
  message: {
    message: 'Too many channel creation attempts. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limit middleware for channel updates
 */
export const channelUpdateLimiter = rateLimit({
  windowMs: ENV.RATE_LIMIT.CHANNELS.UPDATE.WINDOW_MS,
  max: ENV.RATE_LIMIT.CHANNELS.UPDATE.MAX_REQUESTS,
  message: {
    message: 'Too many channel update attempts. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limit middleware for channel member operations
 */
export const channelMemberLimiter = rateLimit({
  windowMs: ENV.RATE_LIMIT.CHANNELS.MEMBERS.WINDOW_MS,
  max: ENV.RATE_LIMIT.CHANNELS.MEMBERS.MAX_REQUESTS,
  message: {
    message: 'Too many member operations. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limit middleware for channel deletion
 */
export const channelDeleteLimiter = rateLimit({
  windowMs: ENV.RATE_LIMIT.CHANNELS.DELETE.WINDOW_MS,
  max: ENV.RATE_LIMIT.CHANNELS.DELETE.MAX_REQUESTS,
  message: {
    message: 'Too many channel deletion attempts. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limit middleware for channel archival
 */
export const channelArchiveLimiter = rateLimit({
  windowMs: ENV.RATE_LIMIT.CHANNELS.ARCHIVE.WINDOW_MS,
  max: ENV.RATE_LIMIT.CHANNELS.ARCHIVE.MAX_REQUESTS,
  message: {
    message: 'Too many channel archive attempts. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limit middleware for channel read operations
 */
export const channelReadLimiter = rateLimit({
  windowMs: ENV.RATE_LIMIT.CHANNELS.READ.WINDOW_MS,
  max: ENV.RATE_LIMIT.CHANNELS.READ.MAX_REQUESTS,
  message: {
    message: 'Too many channel read attempts. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
}); 