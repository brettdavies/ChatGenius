/**
 * Channel validation constants and utilities
 */

export const CHANNEL_VALIDATION = {
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 80,
    // Allows letters, numbers, hyphens, and underscores
    // Must start with a letter
    // Cannot end with a hyphen or underscore
    PATTERN: /^[a-zA-Z][a-zA-Z0-9-_]*[a-zA-Z0-9]$/,
    ERROR_MESSAGES: {
      TOO_SHORT: 'Channel name must be at least 2 characters long',
      TOO_LONG: 'Channel name cannot exceed 80 characters',
      INVALID_PATTERN: 'Channel name must start with a letter and can only contain letters, numbers, hyphens, and underscores'
    }
  },
  DESCRIPTION: {
    MAX_LENGTH: 1000,
    ERROR_MESSAGES: {
      TOO_LONG: 'Channel description cannot exceed 1000 characters'
    }
  },
  MEMBERS: {
    MAX_COUNT: {
      PUBLIC: 5000,
      PRIVATE: 1000,
      DM: 2
    },
    ERROR_MESSAGES: {
      MAX_REACHED: (type: 'public' | 'private' | 'dm') => 
        `Channel has reached maximum member limit for ${type} channels`
    }
  }
} as const;

/**
 * Validates a channel name
 */
export function validateChannelName(name: string): { isValid: boolean; error?: string } {
  if (name.length < CHANNEL_VALIDATION.NAME.MIN_LENGTH) {
    return { isValid: false, error: CHANNEL_VALIDATION.NAME.ERROR_MESSAGES.TOO_SHORT };
  }
  
  if (name.length > CHANNEL_VALIDATION.NAME.MAX_LENGTH) {
    return { isValid: false, error: CHANNEL_VALIDATION.NAME.ERROR_MESSAGES.TOO_LONG };
  }
  
  if (!CHANNEL_VALIDATION.NAME.PATTERN.test(name)) {
    return { isValid: false, error: CHANNEL_VALIDATION.NAME.ERROR_MESSAGES.INVALID_PATTERN };
  }
  
  return { isValid: true };
}

/**
 * Validates a channel description
 */
export function validateChannelDescription(description?: string): { isValid: boolean; error?: string } {
  if (!description) {
    return { isValid: true };
  }
  
  if (description.length > CHANNEL_VALIDATION.DESCRIPTION.MAX_LENGTH) {
    return { isValid: false, error: CHANNEL_VALIDATION.DESCRIPTION.ERROR_MESSAGES.TOO_LONG };
  }
  
  return { isValid: true };
}

/**
 * Validates channel member count
 */
export function validateChannelMemberCount(
  currentCount: number,
  type: 'PUBLIC' | 'PRIVATE' | 'DM'
): { isValid: boolean; error?: string } {
  const maxCount = CHANNEL_VALIDATION.MEMBERS.MAX_COUNT[type];
  
  if (currentCount >= maxCount) {
    return { 
      isValid: false, 
      error: CHANNEL_VALIDATION.MEMBERS.ERROR_MESSAGES.MAX_REACHED(type.toLowerCase() as 'public' | 'private' | 'dm')
    };
  }
  
  return { isValid: true };
}

/**
 * Sanitizes channel input
 */
export function sanitizeChannelInput(input: string): string {
  return input
    .trim()
    // Remove any HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove any null bytes
    .replace(/\0/g, '')
    // Remove any control characters
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Convert multiple spaces to single space
    .replace(/\s+/g, ' ');
} 