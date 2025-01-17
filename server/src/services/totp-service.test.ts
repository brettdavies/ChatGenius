import { TOTPService } from './totp-service.js';

describe('TOTPService', () => {
  const totpService = new TOTPService();
  const testUserId = 'test123';
  const testEmail = 'test@example.com';

  describe('generateTOTP', () => {
    it('should generate TOTP secret and QR code', async () => {
      const result = await totpService.generateTOTP(testUserId, testEmail);

      expect(result.secret).toBeDefined();
      expect(result.secret.length).toBeGreaterThan(0);
      expect(result.otpauthUrl).toContain('ChatGenius:test@example.com');
      expect(result.qrCodeUrl).toContain('data:image/png;base64');
    });
  });

  describe('validateToken', () => {
    it('should validate correct token', () => {
      const secret = 'ABCDEFGHIJKLMNOP';
      const token = totpService.generateCurrentToken(secret);
      
      const isValid = totpService.validateToken(secret, token);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect token', () => {
      const secret = 'ABCDEFGHIJKLMNOP';
      const invalidToken = '000000';
      
      const isValid = totpService.validateToken(secret, invalidToken);
      expect(isValid).toBe(false);
    });
  });

  describe('backup codes', () => {
    it('should generate correct number of backup codes', () => {
      const codes = totpService.generateBackupCodes();
      expect(codes.length).toBe(10); // NUM_BACKUP_CODES
      
      // Each code should be 8 characters (BACKUP_CODE_LENGTH)
      codes.forEach(code => {
        expect(code.length).toBe(8);
      });
    });

    it('should validate backup code', () => {
      const codes = totpService.generateBackupCodes();
      const testCode = codes[0];
      
      const isValid = totpService.validateBackupCode(codes, testCode);
      expect(isValid).toBe(true);
    });

    it('should reject invalid backup code', () => {
      const codes = totpService.generateBackupCodes();
      const invalidCode = 'invalid';
      
      const isValid = totpService.validateBackupCode(codes, invalidCode);
      expect(isValid).toBe(false);
    });

    it('should remove used backup code', () => {
      const codes = totpService.generateBackupCodes();
      const testCode = codes[0];
      
      const remainingCodes = totpService.removeUsedBackupCode(codes, testCode);
      expect(remainingCodes.length).toBe(codes.length - 1);
      expect(remainingCodes).not.toContain(testCode);
    });
  });
}); 