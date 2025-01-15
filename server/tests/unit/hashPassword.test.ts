import { describe, it, expect, beforeAll } from '@jest/globals';
import { hashPassword, comparePassword } from '@utils/hashPassword';

describe('Password Hashing', () => {
  const password = 'testpassword123';
  const rounds = 10;

  describe('hashPassword', () => {
    it('should hash password with default rounds', async () => {
      const hash = await hashPassword(password);
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.startsWith('$2a$')).toBe(true);
    });

    it('should hash password with specified rounds', async () => {
      const hash = await hashPassword(password, { rounds });
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.startsWith(`$2a$${rounds}$`)).toBe(true);
    });

    it('should generate different hashes for same password', async () => {
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    let hash: string;

    beforeAll(async () => {
      hash = await hashPassword(password);
    });

    it('should return true for correct password', async () => {
      const isValid = await comparePassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const isValid = await comparePassword('wrongpassword', hash);
      expect(isValid).toBe(false);
    });
  });
}); 