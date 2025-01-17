import { ulid } from 'ulid';

/**
 * Custom format validators for OpenAPI schema validation
 */
export const customFormats = {
  /**
   * Validates that a string is a valid ULID
   * ULIDs are 26 characters long, using Crockford's base32 (numbers 0-9 and letters A-Z)
   */
  ulid: {
    validate: (value: string) => {
      if (typeof value !== 'string') return false;
      return /^[0-9A-Z]{26}$/.test(value);
    },
    type: 'string'
  }
} as const; 