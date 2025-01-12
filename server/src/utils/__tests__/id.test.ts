import { generateId, getTimestampFromId, isValidId, compareIds } from '../id';

describe('ULID Utilities', () => {
    describe('generateId', () => {
        it('should generate a valid ULID', () => {
            const id = generateId();
            expect(id).toHaveLength(26);
            expect(isValidId(id)).toBe(true);
        });

        it('should generate unique IDs', () => {
            const ids = new Set<string>();
            for (let i = 0; i < 1000; i++) {
                ids.add(generateId());
            }
            expect(ids.size).toBe(1000);
        });

        it('should generate chronologically sortable IDs', async () => {
            const id1 = generateId();
            await new Promise(resolve => setTimeout(resolve, 1));
            const id2 = generateId();
            expect(compareIds(id1, id2)).toBe(-1);
        });
    });

    describe('getTimestampFromId', () => {
        it('should extract timestamp from ULID', () => {
            const now = Date.now();
            const id = generateId();
            const timestamp = getTimestampFromId(id);
            expect(Math.abs(timestamp - now)).toBeLessThan(1000);
        });

        it('should throw error for invalid ULID', () => {
            expect(() => getTimestampFromId('invalid')).toThrow('Invalid ULID');
        });
    });

    describe('isValidId', () => {
        it('should validate correct ULIDs', () => {
            const id = generateId();
            expect(isValidId(id)).toBe(true);
        });

        it('should reject invalid ULIDs', () => {
            expect(isValidId('')).toBe(false);
            expect(isValidId('invalid')).toBe(false);
            expect(isValidId('0'.repeat(26))).toBe(false);
        });
    });

    describe('compareIds', () => {
        it('should compare IDs chronologically', () => {
            const id1 = generateId();
            const id2 = generateId();
            expect(compareIds(id1, id2)).toBe(-1);
            expect(compareIds(id2, id1)).toBe(1);
            expect(compareIds(id1, id1)).toBe(0);
        });

        it('should throw error for invalid IDs', () => {
            const validId = generateId();
            expect(() => compareIds('invalid', validId)).toThrow('Invalid ULID');
            expect(() => compareIds(validId, 'invalid')).toThrow('Invalid ULID');
        });
    });
}); 