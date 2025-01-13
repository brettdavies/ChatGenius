export const LENGTH_LIMITS = {
  CHANNEL_NAME: {
    MIN: 3,
    MAX: 50
  },
  BIO: {
    MAX: 500
  }
} as const;

export const REGEX_PATTERNS = {
  CHANNEL_NAME: /^[a-z0-9-]+$/,
  USERNAME: /^[a-zA-Z0-9_-]+$/
} as const;

export const VALIDATION_RULES = {
  CHANNEL_NAME: {
    MESSAGE: 'Channel name must be between 3-50 characters and contain only lowercase letters, numbers, and hyphens'
  }
} as const; 