import rateLimit from 'express-rate-limit';
import { ENV } from '../config/env.js';

const createLimiter = (options: { windowMs: number; max: number; message: { message: string; code: string } }) => {
  // Skip rate limiting in development and test modes
  if (ENV.NODE_ENV === 'development' || ENV.NODE_ENV === 'test') {
    return (_req: any, _res: any, next: any) => next();
  }
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: options.message
  });
};

// Rate limit for SSE connections - 1 connection per channel per user
export const eventSubscriptionLimiter = createLimiter({
  windowMs: ENV.RATE_LIMIT.EVENTS.SUBSCRIPTION.WINDOW_MS,
  max: ENV.RATE_LIMIT.EVENTS.SUBSCRIPTION.MAX_REQUESTS,
  message: {
    message: 'Too many event subscriptions from this IP, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// Rate limit for typing indicators - 30 updates per minute
export const typingIndicatorLimiter = createLimiter({
  windowMs: ENV.RATE_LIMIT.EVENTS.TYPING.WINDOW_MS,
  max: ENV.RATE_LIMIT.EVENTS.TYPING.MAX_REQUESTS,
  message: {
    message: 'Too many typing indicator updates from this IP, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// Rate limit for presence updates - 60 updates per minute
export const presenceUpdateLimiter = createLimiter({
  windowMs: ENV.RATE_LIMIT.EVENTS.PRESENCE.WINDOW_MS,
  max: ENV.RATE_LIMIT.EVENTS.PRESENCE.MAX_REQUESTS,
  message: {
    message: 'Too many presence updates from this IP, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  }
}); 