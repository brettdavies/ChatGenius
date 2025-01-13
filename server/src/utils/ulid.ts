import { monotonicFactory } from 'ulid';

const ulid = monotonicFactory();

/**
 * Generate a ULID (Universally Unique Lexicographically Sortable Identifier)
 * @returns A 26-character ULID string
 */
export const generateULID = (): string => ulid();

/**
 * Validate if a string is a valid ULID
 * @param id The string to validate
 * @returns boolean indicating if the string is a valid ULID
 */
export const isValidULID = (id: string): boolean => {
  return /^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$/.test(id);
}; 