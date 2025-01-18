import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { ErrorCodes } from '../openapi/schemas/common.js';

export class TOTPError extends Error {
  constructor(public code: typeof ErrorCodes[keyof typeof ErrorCodes], message: string) {
    super(message);
    this.name = 'TOTPError';
  }
}

export class TOTPService {
  private readonly BACKUP_CODE_LENGTH = 8;
  private readonly NUM_BACKUP_CODES = 10;

  /**
   * Generates a new TOTP secret for a user
   * @returns Object containing secret and QR code data URL
   * @throws {TOTPError} If generation fails
   */
  async generateTOTP(userId: string, email: string): Promise<{
    secret: string;
    otpauthUrl: string;
    qrCodeUrl: string;
  }> {
    try {
      // Generate a secret
      const secret = speakeasy.generateSecret({
        name: `ChatGenius:${email}`,
        length: 20
      });

      if (!secret.base32 || !secret.otpauth_url) {
        throw new TOTPError(
          ErrorCodes.TOTP_GENERATION_FAILED,
          'Failed to generate TOTP secret'
        );
      }

      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

      return {
        secret: secret.base32,
        otpauthUrl: secret.otpauth_url,
        qrCodeUrl
      };
    } catch (error) {
      console.error('[TOTPService] Failed to generate TOTP:', error);
      throw new TOTPError(
        ErrorCodes.TOTP_GENERATION_FAILED,
        'Failed to generate TOTP credentials'
      );
    }
  }

  /**
   * Validates a TOTP token
   * @returns boolean indicating if token is valid
   * @throws {TOTPError} If validation fails
   */
  validateToken(secret: string, token: string): boolean {
    if (!secret || !token) {
      throw new TOTPError(
        ErrorCodes.INVALID_TOTP_INPUT,
        'Secret and token are required'
      );
    }

    try {
      return speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 1 // Allow 30 seconds of clock drift
      });
    } catch (error) {
      console.error('[TOTPService] Failed to validate token:', error);
      throw new TOTPError(
        ErrorCodes.TOTP_VALIDATION_FAILED,
        'Failed to validate TOTP token'
      );
    }
  }

  /**
   * Generates current TOTP token (for testing)
   * @throws {TOTPError} If generation fails
   */
  generateCurrentToken(secret: string): string {
    if (!secret) {
      throw new TOTPError(
        ErrorCodes.INVALID_TOTP_INPUT,
        'Secret is required'
      );
    }

    try {
      return speakeasy.totp({
        secret,
        encoding: 'base32'
      });
    } catch (error) {
      console.error('[TOTPService] Failed to generate current token:', error);
      throw new TOTPError(
        ErrorCodes.TOTP_GENERATION_FAILED,
        'Failed to generate current TOTP token'
      );
    }
  }

  /**
   * Generates a set of backup codes
   * @returns Array of backup codes
   * @throws {TOTPError} If generation fails
   */
  generateBackupCodes(): string[] {
    try {
      const codes: string[] = [];
      for (let i = 0; i < this.NUM_BACKUP_CODES; i++) {
        const code = crypto.randomBytes(4).toString('hex').slice(0, this.BACKUP_CODE_LENGTH);
        codes.push(code);
      }
      return codes;
    } catch (error) {
      console.error('[TOTPService] Failed to generate backup codes:', error);
      throw new TOTPError(
        ErrorCodes.BACKUP_CODE_GENERATION_FAILED,
        'Failed to generate backup codes'
      );
    }
  }

  /**
   * Validates a backup code
   * @returns boolean indicating if code is valid
   * @throws {TOTPError} If validation fails
   */
  validateBackupCode(storedCodes: string | string[], submittedCode: string): boolean {
    if (!storedCodes || !submittedCode) {
      throw new TOTPError(
        ErrorCodes.INVALID_BACKUP_CODE_INPUT,
        'Stored codes and submitted code are required'
      );
    }

    const codes = Array.isArray(storedCodes) ? storedCodes : [storedCodes];
    return codes.includes(submittedCode);
  }

  /**
   * Removes a used backup code
   * @returns Array of remaining backup codes
   * @throws {TOTPError} If removal fails
   */
  removeUsedBackupCode(storedCodes: string[], usedCode: string): string[] {
    if (!Array.isArray(storedCodes) || !usedCode) {
      throw new TOTPError(
        ErrorCodes.INVALID_BACKUP_CODE_INPUT,
        'Valid stored codes array and used code are required'
      );
    }

    return storedCodes.filter(code => code !== usedCode);
  }
} 