import rateLimit from 'express-rate-limit';
import { ENV } from '../config/env.js';

// Rate limit for TOTP setup
export const totpSetupLimiter = rateLimit({
  windowMs: ENV.RATE_LIMIT.TOTP.SETUP.WINDOW_MS,
  max: ENV.RATE_LIMIT.TOTP.SETUP.MAX_REQUESTS,
  message: {
    message: 'Too many TOTP setup attempts. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// Rate limit for TOTP verification
export const totpVerifyLimiter = rateLimit({
  windowMs: ENV.RATE_LIMIT.TOTP.VERIFY.WINDOW_MS,
  max: ENV.RATE_LIMIT.TOTP.VERIFY.MAX_REQUESTS,
  message: {
    message: 'Too many TOTP verification attempts. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// Rate limit for TOTP validation during login
export const totpValidateLimiter = rateLimit({
  windowMs: ENV.RATE_LIMIT.TOTP.VALIDATE.WINDOW_MS,
  max: ENV.RATE_LIMIT.TOTP.VALIDATE.MAX_REQUESTS,
  message: {
    message: 'Too many 2FA validation attempts. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
}); 