import rateLimit from 'express-rate-limit';
import { ENV } from '../config/env.js';

/**
 * Creates a rate limiter with consistent configuration
 */
export const createLimiter = (options: {
  windowMs: number;
  max: number;
  message: { message: string; code: string };
}) => {
  // Skip rate limiting in development and test modes
  if (ENV.NODE_ENV === 'development' || ENV.NODE_ENV === 'test') {
    return (_req: any, _res: any, next: any) => next();
  }

  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: options.message,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false  // Disable the `X-RateLimit-*` headers
  });
};

// Auth rate limiters
export const totpSetupLimiter = createLimiter({
  windowMs: ENV.RATE_LIMIT.TOTP.SETUP.WINDOW_MS,
  max: ENV.RATE_LIMIT.TOTP.SETUP.MAX_REQUESTS,
  message: {
    message: 'Too many TOTP setup attempts. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

export const totpVerifyLimiter = createLimiter({
  windowMs: ENV.RATE_LIMIT.TOTP.VERIFY.WINDOW_MS,
  max: ENV.RATE_LIMIT.TOTP.VERIFY.MAX_REQUESTS,
  message: {
    message: 'Too many TOTP verification attempts. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

export const totpValidateLimiter = createLimiter({
  windowMs: ENV.RATE_LIMIT.TOTP.VALIDATE.WINDOW_MS,
  max: ENV.RATE_LIMIT.TOTP.VALIDATE.MAX_REQUESTS,
  message: {
    message: 'Too many 2FA validation attempts. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// Channel rate limiters
export const channelCreateLimiter = createLimiter({
  windowMs: ENV.RATE_LIMIT.CHANNELS.CREATE.WINDOW_MS,
  max: ENV.RATE_LIMIT.CHANNELS.CREATE.MAX_REQUESTS,
  message: {
    message: 'Too many channel creation attempts. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

export const channelUpdateLimiter = createLimiter({
  windowMs: ENV.RATE_LIMIT.CHANNELS.UPDATE.WINDOW_MS,
  max: ENV.RATE_LIMIT.CHANNELS.UPDATE.MAX_REQUESTS,
  message: {
    message: 'Too many channel update attempts. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

export const channelMemberLimiter = createLimiter({
  windowMs: ENV.RATE_LIMIT.CHANNELS.MEMBERS.WINDOW_MS,
  max: ENV.RATE_LIMIT.CHANNELS.MEMBERS.MAX_REQUESTS,
  message: {
    message: 'Too many member operations. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

export const channelDeleteLimiter = createLimiter({
  windowMs: ENV.RATE_LIMIT.CHANNELS.DELETE.WINDOW_MS,
  max: ENV.RATE_LIMIT.CHANNELS.DELETE.MAX_REQUESTS,
  message: {
    message: 'Too many channel deletion attempts. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

export const channelArchiveLimiter = createLimiter({
  windowMs: ENV.RATE_LIMIT.CHANNELS.ARCHIVE.WINDOW_MS,
  max: ENV.RATE_LIMIT.CHANNELS.ARCHIVE.MAX_REQUESTS,
  message: {
    message: 'Too many channel archive attempts. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

export const channelReadLimiter = createLimiter({
  windowMs: ENV.RATE_LIMIT.CHANNELS.READ.WINDOW_MS,
  max: ENV.RATE_LIMIT.CHANNELS.READ.MAX_REQUESTS,
  message: {
    message: 'Too many channel read attempts. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// Message rate limiters
export const messageCreateLimiter = createLimiter({
  windowMs: ENV.RATE_LIMIT.MESSAGES.CREATE.WINDOW_MS,
  max: ENV.RATE_LIMIT.MESSAGES.CREATE.MAX_REQUESTS,
  message: {
    message: 'Too many messages created from this IP, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

export const messageUpdateLimiter = createLimiter({
  windowMs: ENV.RATE_LIMIT.MESSAGES.UPDATE.WINDOW_MS,
  max: ENV.RATE_LIMIT.MESSAGES.UPDATE.MAX_REQUESTS,
  message: {
    message: 'Too many message updates from this IP, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

export const messageDeleteLimiter = createLimiter({
  windowMs: ENV.RATE_LIMIT.MESSAGES.DELETE.WINDOW_MS,
  max: ENV.RATE_LIMIT.MESSAGES.DELETE.MAX_REQUESTS,
  message: {
    message: 'Too many message deletions from this IP, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

export const messageReactionLimiter = createLimiter({
  windowMs: ENV.RATE_LIMIT.MESSAGES.REACTIONS.WINDOW_MS,
  max: ENV.RATE_LIMIT.MESSAGES.REACTIONS.MAX_REQUESTS,
  message: {
    message: 'Too many reactions from this IP, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

export const messageSearchLimiter = createLimiter({
  windowMs: ENV.RATE_LIMIT.MESSAGES.SEARCH.WINDOW_MS,
  max: ENV.RATE_LIMIT.MESSAGES.SEARCH.MAX_REQUESTS,
  message: {
    message: 'Too many search requests from this IP, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// Event rate limiters
export const eventSubscriptionLimiter = createLimiter({
  windowMs: ENV.RATE_LIMIT.EVENTS.SUBSCRIPTION.WINDOW_MS,
  max: ENV.RATE_LIMIT.EVENTS.SUBSCRIPTION.MAX_REQUESTS,
  message: {
    message: 'Too many event subscriptions from this IP, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

export const typingIndicatorLimiter = createLimiter({
  windowMs: ENV.RATE_LIMIT.EVENTS.TYPING.WINDOW_MS,
  max: ENV.RATE_LIMIT.EVENTS.TYPING.MAX_REQUESTS,
  message: {
    message: 'Too many typing indicator updates from this IP, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

export const presenceUpdateLimiter = createLimiter({
  windowMs: ENV.RATE_LIMIT.EVENTS.PRESENCE.WINDOW_MS,
  max: ENV.RATE_LIMIT.EVENTS.PRESENCE.MAX_REQUESTS,
  message: {
    message: 'Too many presence updates from this IP, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  }
}); 