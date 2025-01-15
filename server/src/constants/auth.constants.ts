// Auth error codes
export const AUTH_ERRORS = {
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  USERNAME_TAKEN: 'USERNAME_TAKEN',
  EMAIL_TAKEN: 'EMAIL_TAKEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  MISSING_CREDENTIALS: 'MISSING_CREDENTIALS',
  INVALID_REQUEST: 'INVALID_REQUEST'
} as const;

// Error messages corresponding to error codes
export const AUTH_MESSAGES = {
  USER_NOT_FOUND: 'User not found',
  INVALID_PASSWORD: 'Invalid password',
  INVALID_CREDENTIALS: 'Invalid email or password',
  USERNAME_TAKEN: 'Username already taken',
  EMAIL_TAKEN: 'Email address already taken',
  AUTHENTICATION_ERROR: 'Authentication failed',
  MISSING_CREDENTIALS: 'Email and password are required',
  INVALID_REQUEST: 'Invalid request data'
} as const;

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user'
} as const;

// API routes
export const AUTH_ROUTES = {
  REGISTER: '/register',
  LOGIN: '/login',
  ME: '/me'
} as const;

// Rate limiting configuration
export const RATE_LIMITS = {
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5 // limit each IP to 5 requests per windowMs
  },
  API: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  }
} as const;

// Type exports
export type AuthErrorCode = keyof typeof AUTH_ERRORS;
export type AuthErrorMessage = typeof AUTH_MESSAGES[keyof typeof AUTH_MESSAGES];
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type AuthRoute = typeof AUTH_ROUTES[keyof typeof AUTH_ROUTES]; 