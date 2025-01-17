import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';

export class TOTPService {
  private readonly BACKUP_CODE_LENGTH = 8;
  private readonly NUM_BACKUP_CODES = 10;

  /**
   * Generates a new TOTP secret for a user
   * @returns Object containing secret and QR code data URL
   */
  async generateTOTP(userId: string, email: string): Promise<{
    secret: string;
    otpauthUrl: string;
    qrCodeUrl: string;
  }> {
    // Generate a secret
    const secret = speakeasy.generateSecret({
      name: `ChatGenius:${email}`,
      length: 20
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url!,
      qrCodeUrl
    };
  }

  /**
   * Validates a TOTP token
   * @returns boolean indicating if token is valid
   */
  validateToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1 // Allow 30 seconds of clock drift
    });
  }

  /**
   * Generates current TOTP token (for testing)
   */
  generateCurrentToken(secret: string): string {
    return speakeasy.totp({
      secret,
      encoding: 'base32'
    });
  }

  /**
   * Generates a set of backup codes
   * @returns Array of backup codes
   */
  generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < this.NUM_BACKUP_CODES; i++) {
      const code = crypto.randomBytes(4).toString('hex').slice(0, this.BACKUP_CODE_LENGTH);
      codes.push(code);
    }
    return codes;
  }

  /**
   * Validates a backup code
   * @returns boolean indicating if code is valid
   */
  validateBackupCode(storedCodes: string[], submittedCode: string): boolean {
    return storedCodes.includes(submittedCode);
  }

  /**
   * Removes a used backup code
   * @returns Array of remaining backup codes
   */
  removeUsedBackupCode(storedCodes: string[], usedCode: string): string[] {
    return storedCodes.filter(code => code !== usedCode);
  }
} 