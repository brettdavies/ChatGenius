import express from 'express';
import passport from '../auth/passport.js';
import { UserService, UserError } from '../services/user-service.js';
import { User } from '../auth/types.js';
import { AUTH_MESSAGES } from '../constants/auth.constants.js';
import { validateRequest } from '../middleware/validate-request.js';
import { TOTPService } from '../services/totp-service.js';
import { isAuthenticated } from '../middleware/auth.js';
import pool from '../db/pool.js';

const router = express.Router();
const totpService = new TOTPService();
const userService = new UserService();

// Register
router.post('/register', validateRequest, async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json({ user });
  } catch (error: unknown) {
    if (error instanceof UserError) {
      res.status(400).json({ message: error.message, code: error.code });
    } else {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

// Login
router.post('/login', validateRequest, (req, res, next) => {
  passport.authenticate('local', (err: Error | null, user: User | false, info: { message: string }) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: info.message });
    }
    req.logIn(user, async (err) => {
      if (err) {
        return next(err);
      }
      try {
        const profile = await userService.getUserById(user.id);
        return res.json({ user: profile });
      } catch (error) {
        return next(error);
      }
    });
  })(req, res, next);
});

// Get user profile
router.get('/me', validateRequest, async (req, res) => {
  const userId = req.query.userId as string;
  if (!userId) {
    return res.status(400).json({ message: AUTH_MESSAGES.MISSING_CREDENTIALS });
  }

  try {
    const profile = await userService.getUserById(userId);
    res.json({ user: profile });
  } catch (error: unknown) {
    if (error instanceof UserError) {
      if (error.code === 'USER_NOT_FOUND') {
        res.status(404).json({ message: error.message, code: error.code });
      } else {
        res.status(400).json({ message: error.message, code: error.code });
      }
    } else {
      console.error('Profile fetch error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

// Update user profile
router.put('/me', validateRequest, async (req, res) => {
  const userId = req.query.userId as string;
  if (!userId) {
    return res.status(400).json({ message: AUTH_MESSAGES.MISSING_CREDENTIALS });
  }

  try {
    const profile = await userService.updateUser(userId, req.body);
    res.json({ user: profile });
  } catch (error) {
    if (error instanceof UserError) {
      if (error.code === 'USER_NOT_FOUND') {
        res.status(404).json({ message: error.message, code: error.code });
      } else {
        res.status(400).json({ message: error.message, code: error.code });
      }
    } else {
      console.error('Profile update error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

// Delete user account
router.delete('/me', validateRequest, async (req, res) => {
  const userId = req.query.userId as string;
  if (!userId) {
    return res.status(400).json({ message: AUTH_MESSAGES.MISSING_CREDENTIALS });
  }

  try {
    await userService.deleteUser(userId);
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
      }
    });
    res.status(204).send();
  } catch (error) {
    if (error instanceof UserError) {
      if (error.code === 'USER_NOT_FOUND') {
        res.status(404).json({ message: error.message, code: error.code });
      } else {
        res.status(400).json({ message: error.message, code: error.code });
      }
    } else {
      console.error('Account deletion error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ message: 'Error during logout' });
    }
    res.status(204).send();
  });
});

/**
 * Initialize 2FA setup
 * Returns TOTP secret and QR code for user to scan
 */
router.post('/2fa/setup', isAuthenticated, async (req: express.Request, res) => {
  const userId = req.user!.id;
  const user = await userService.getUserById(userId);

  if (user.totpEnabled) {
    throw new UserError('2FA_ALREADY_ENABLED', '2FA is already enabled for this account');
  }

  const { secret, qrCodeUrl } = await totpService.generateTOTP(userId, user.email);
  const backupCodes = totpService.generateBackupCodes();

  // Store secret and backup codes temporarily until verified
  await pool.query(
    `UPDATE users 
     SET totp_secret = $1, backup_codes = $2 
     WHERE id = $3`,
    [secret, backupCodes, userId]
  );

  res.json({ qrCodeUrl, backupCodes });
});

/**
 * Verify and enable 2FA
 * Requires a valid TOTP token to enable
 */
router.post('/2fa/verify', isAuthenticated, validateRequest, async (req: express.Request, res) => {
  const { token } = req.body;
  const userId = req.user!.id;
  const user = await userService.getUserById(userId);

  if (user.totpEnabled) {
    throw new UserError('2FA_ALREADY_ENABLED', '2FA is already enabled for this account');
  }

  if (!user.totpSecret) {
    throw new UserError('2FA_NOT_SETUP', '2FA has not been set up for this account');
  }

  const isValid = totpService.validateToken(user.totpSecret, token);
  if (!isValid) {
    throw new UserError('INVALID_TOKEN', 'Invalid verification code');
  }

  // Enable 2FA
  await pool.query(
    `UPDATE users 
     SET totp_enabled = true, totp_verified_at = CURRENT_TIMESTAMP 
     WHERE id = $1`,
    [userId]
  );

  res.json({ message: '2FA has been enabled successfully' });
});

/**
 * Validate 2FA token during login
 */
router.post('/2fa/validate', validateRequest, async (req, res) => {
  const { email, token, isBackupCode = false } = req.body;
  const user = await userService.getUserByEmail(email);

  if (!user.totpEnabled) {
    throw new UserError('2FA_NOT_ENABLED', '2FA is not enabled for this account');
  }

  let isValid = false;
  if (isBackupCode) {
    isValid = totpService.validateBackupCode(user.backupCodes, token);
    if (isValid) {
      // Remove used backup code
      const remainingCodes = totpService.removeUsedBackupCode(user.backupCodes, token);
      await pool.query(
        'UPDATE users SET backup_codes = $1 WHERE id = $2',
        [remainingCodes, user.id]
      );
    }
  } else {
    isValid = totpService.validateToken(user.totpSecret!, token);
  }

  if (!isValid) {
    throw new UserError('INVALID_TOKEN', 'Invalid verification code');
  }

  // Update last verified timestamp
  await pool.query(
    'UPDATE users SET totp_verified_at = CURRENT_TIMESTAMP WHERE id = $1',
    [user.id]
  );

  res.json({ message: 'Token validated successfully' });
});

/**
 * Disable 2FA
 * Requires password confirmation
 */
router.post('/2fa/disable', isAuthenticated, validateRequest, async (req: express.Request, res) => {
  const { password } = req.body;
  const userId = req.user!.id;
  
  // Verify password
  await userService.verifyPassword(userId, password);

  // Disable 2FA
  await pool.query(
    `UPDATE users 
     SET totp_enabled = false, 
         totp_secret = NULL, 
         backup_codes = ARRAY[]::TEXT[], 
         totp_verified_at = NULL 
     WHERE id = $1`,
    [userId]
  );

  res.json({ message: '2FA has been disabled successfully' });
});

export default router; 