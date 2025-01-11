import { ulid, decodeTime } from 'ulid';

/**
 * Generates a new ULID (Universally Unique Lexicographically Sortable Identifier).
 * ULIDs are 26 characters long, case-insensitive, and contain:
 * - First 10 chars: Timestamp (milliseconds since Unix epoch)
 * - Last 16 chars: Randomness
 * 
 * @returns A new ULID string
 */
export function generateId(): string {
    return ulid();
}

/**
 * Extracts the timestamp from a ULID.
 * 
 * @param id - The ULID to decode
 * @returns The timestamp in milliseconds since Unix epoch
 * @throws Error if the ULID is invalid
 */
export function getTimestampFromId(id: string): number {
    if (!isValidId(id)) {
        throw new Error('Invalid ULID format');
    }
    return decodeTime(id);
}

/**
 * Validates a ULID string.
 * ULIDs are 26 characters long and use Crockford's base32 alphabet
 * (0-9, A-Z excluding I, L, O, U).
 * 
 * @param id - The string to validate
 * @returns true if the string is a valid ULID, false otherwise
 */
export function isValidId(id: string): boolean {
    if (typeof id !== 'string' || id.length !== 26) {
        return false;
    }
    
    // ULIDs use Crockford's base32 alphabet (0-9, A-Z excluding I, L, O, U)
    const validChars = /^[0-9A-HJ-KM-NP-TV-Z]{26}$/i;
    return validChars.test(id);
}

/**
 * Compares two ULIDs for sorting.
 * ULIDs are lexicographically sortable, which means they can be sorted as strings
 * while maintaining chronological order.
 * 
 * @param a - First ULID
 * @param b - Second ULID
 * @returns -1 if a < b, 0 if a === b, 1 if a > b
 */
export function compareIds(a: string, b: string): number {
    return a < b ? -1 : a > b ? 1 : 0;
} 