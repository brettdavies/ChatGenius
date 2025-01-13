import { LENGTH_LIMITS, FILE_LIMITS } from './limits.constants';

export const REGEX_PATTERNS = {
  USERNAME: /^[a-zA-Z0-9_-]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  CHANNEL_NAME: /^[a-zA-Z0-9-_\s]+$/,
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  TIMEZONE: /^[A-Za-z_]+\/[A-Za-z_]+$/
} as const;

export const VALIDATION_RULES = {
  USERNAME: {
    MIN_LENGTH: LENGTH_LIMITS.USERNAME.MIN,
    MAX_LENGTH: LENGTH_LIMITS.USERNAME.MAX,
    PATTERN: REGEX_PATTERNS.USERNAME,
    MESSAGE: `Username must be between ${LENGTH_LIMITS.USERNAME.MIN}-${LENGTH_LIMITS.USERNAME.MAX} characters and can only contain letters, numbers, underscores, and hyphens`
  },
  PASSWORD: {
    MIN_LENGTH: LENGTH_LIMITS.PASSWORD.MIN,
    MAX_LENGTH: LENGTH_LIMITS.PASSWORD.MAX,
    PATTERN: REGEX_PATTERNS.PASSWORD,
    MESSAGE: `Password must be between ${LENGTH_LIMITS.PASSWORD.MIN}-${LENGTH_LIMITS.PASSWORD.MAX} characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character`
  },
  EMAIL: {
    PATTERN: REGEX_PATTERNS.EMAIL,
    MESSAGE: 'Please enter a valid email address'
  },
  CHANNEL_NAME: {
    MIN_LENGTH: LENGTH_LIMITS.CHANNEL_NAME.MIN,
    MAX_LENGTH: LENGTH_LIMITS.CHANNEL_NAME.MAX,
    PATTERN: REGEX_PATTERNS.CHANNEL_NAME,
    MESSAGE: `Channel name must be between ${LENGTH_LIMITS.CHANNEL_NAME.MIN}-${LENGTH_LIMITS.CHANNEL_NAME.MAX} characters and can only contain letters, numbers, spaces, underscores, and hyphens`
  },
  MESSAGE: {
    MAX_LENGTH: LENGTH_LIMITS.MESSAGE.MAX,
    MESSAGE: `Message cannot exceed ${LENGTH_LIMITS.MESSAGE.MAX} characters`
  },
  FILE_UPLOAD: {
    MAX_SIZE: FILE_LIMITS.MAX_SIZE,
    ALLOWED_TYPES: FILE_LIMITS.ALLOWED_TYPES.ALL,
    MAX_FILES: FILE_LIMITS.MAX_FILES.PER_UPLOAD,
    MESSAGE: `File must be less than ${FILE_LIMITS.MAX_SIZE / (1024 * 1024)}MB and be a valid image (${FILE_LIMITS.ALLOWED_TYPES.IMAGES.join(', ')}) or document (${FILE_LIMITS.ALLOWED_TYPES.DOCUMENTS.join(', ')})`
  }
} as const;

export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_FORMAT: 'Invalid format',
  SERVER_ERROR: 'An error occurred. Please try again later.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  NOT_FOUND: 'The requested resource was not found',
  FORBIDDEN: 'You do not have permission to access this resource',
  RATE_LIMITED: 'Too many requests. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  FILE_TOO_LARGE: `File size must not exceed ${FILE_LIMITS.MAX_SIZE / (1024 * 1024)}MB`,
  TOO_MANY_FILES: `You can only upload up to ${FILE_LIMITS.MAX_FILES.PER_UPLOAD} files at once`,
  INVALID_FILE_TYPE: 'File type not supported'
} as const; 