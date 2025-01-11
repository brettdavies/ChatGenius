import { generateId, getTimestampFromId, isValidId, compareIds } from '../id';

describe('ULID Utilities', () => {
    describe('generateId', () => {
        it('should generate a valid ULID', () => {
            const id = generateId();
            expect(id).toHaveLength(26);
            expect(isValidId(id)).toBe(true);
        });

        it('should generate unique IDs', () => {
            const ids = new Set();
            for (let i = 0; i < 1000; i++) {
                ids.add(generateId());
            }
            expect(ids.size).toBe(1000);
        });

        it('should generate chronologically sortable IDs', async () => {
            const id1 = generateId();
            // Wait 1ms to ensure different timestamps
            await new Promise(resolve => setTimeout(resolve, 1));
            const id2 = generateId();
            
            const time1 = getTimestampFromId(id1);
            const time2 = getTimestampFromId(id2);
            expect(time1).toBeLessThan(time2);
        });
    });

    describe('getTimestampFromId', () => {
        it('should extract correct timestamp from ULID', () => {
            const now = Date.now();
            const id = generateId();
            const timestamp = getTimestampFromId(id);
            
            // Should be within 1 second
            expect(Math.abs(timestamp - now)).toBeLessThan(1000);
        });

        it('should throw error for invalid ULID', () => {
            expect(() => getTimestampFromId('invalid')).toThrow('Invalid ULID format');
        });
    });

    describe('isValidId', () => {
        it('should return true for valid ULIDs', () => {
            const id = generateId();
            expect(isValidId(id)).toBe(true);
        });

        it('should return false for invalid ULIDs', () => {
            expect(isValidId('invalid')).toBe(false);
            expect(isValidId('')).toBe(false);
            expect(isValidId('12345')).toBe(false);
            expect(isValidId('I'.repeat(26))).toBe(false); // Invalid char (I)
            expect(isValidId('L'.repeat(26))).toBe(false); // Invalid char (L)
            expect(isValidId('O'.repeat(26))).toBe(false); // Invalid char (O)
            expect(isValidId('U'.repeat(26))).toBe(false); // Invalid char (U)
        });
    });

    describe('compareIds', () => {
        it('should correctly compare ULIDs', async () => {
            const id1 = generateId();
            // Wait 1ms to ensure different timestamps
            await new Promise(resolve => setTimeout(resolve, 1));
            const id2 = generateId();

            expect(compareIds(id1, id1)).toBe(0); // Same ID
            expect(compareIds(id1, id2)).toBe(-1); // First ID is earlier
            expect(compareIds(id2, id1)).toBe(1); // Second ID is later
        });
    });
}); 