export const LENGTH_LIMITS = {
  USERNAME: {
    MIN: 3,
    MAX: 50
  },
  PASSWORD: {
    MIN: 8,
    MAX: 100
  },
  CHANNEL_NAME: {
    MIN: 2,
    MAX: 100
  },
  MESSAGE: {
    MAX: 5000
  },
  BIO: {
    MAX: 500
  }
} as const;

export const FILE_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/gif'] as const,
    DOCUMENTS: ['application/pdf'] as const,
    ALL: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'] as const
  },
  MAX_FILES: {
    PER_MESSAGE: 5,
    PER_UPLOAD: 10
  }
} as const;

export const RATE_LIMITS = {
  MESSAGES: {
    PER_MINUTE: 60,
    PER_CHANNEL: 1000
  },
  API_CALLS: {
    PER_MINUTE: 100,
    PER_HOUR: 1000
  }
} as const; 