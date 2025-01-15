// Auth error codes
export const AUTH_ERRORS = {
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  USERNAME_TAKEN: 'USERNAME_TAKEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  REFRESH_TOKEN_INVALID: 'REFRESH_TOKEN_INVALID',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS'
} as const;

// Error messages corresponding to error codes
export const AUTH_MESSAGES = {
  NO_TOKEN: 'No token provided',
  INVALID_TOKEN: 'Invalid token',
  TOKEN_EXPIRED: 'Token expired',
  USER_NOT_FOUND: 'User not found',
  AUTH_REQUIRED: 'Authentication required',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
  TOO_MANY_REQUESTS: 'Too many requests, please try again later',
  INVALID_CREDENTIALS: 'Invalid username or password',
  USERNAME_TAKEN: 'Username already taken',
  AUTHENTICATION_ERROR: 'Authentication failed',
  REFRESH_TOKEN_INVALID: 'Invalid refresh token'
} as const;

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user'
} as const;

// Token configuration
export const TOKEN_CONFIG = {
  TOKEN_TYPE: 'Bearer',
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  }
} as const;

// API routes
export const AUTH_ROUTES = {
  REGISTER: '/register',
  LOGIN: '/login',
  LOGOUT: '/logout',
  REFRESH: '/refresh',
  ME: '/me'
} as const;

// Type exports
export type AuthErrorCode = keyof typeof AUTH_ERRORS;
export type AuthErrorMessage = typeof AUTH_MESSAGES[keyof typeof AUTH_MESSAGES];
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type AuthRoute = typeof AUTH_ROUTES[keyof typeof AUTH_ROUTES]; 