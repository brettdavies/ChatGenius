import express from 'express';
import passport from '../auth/passport.js';
import { UserService, UserError } from '../services/user-service.js';
import { User } from '../auth/types.js';
import { AUTH_MESSAGES } from '../constants/auth.constants.js';
import { validateRequest } from '../middleware/validate-request.js';
import { TOTPService } from '../services/totp-service.js';
import { isAuthenticated, validateSession } from '../middleware/auth.js';
import pool from '../db/pool.js';
import { totpSetupLimiter, totpVerifyLimiter } from '../middleware/auth-rate-limit.js';

const router = express.Router();
const totpService = new TOTPService();
const userService = new UserService();

// Register
router.post('/register', validateRequest, async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    
    // Establish session
    req.logIn(user, (err) => {
      if (err) {
        console.error('Session error:', err);
        return res.status(500).json({
          message: 'Failed to create session',
          errors: [{
            message: 'Failed to create session',
            code: 'SESSION_ERROR',
            path: '/register'
          }]
        });
      }

      res.status(201).json({ 
        user,
        message: 'User registered successfully',
        errors: [] // Required by OpenAPI schema
      });
    });
  } catch (error: unknown) {
    if (error instanceof UserError) {
      res.status(400).json({ 
        message: error.message,
        errors: [{
          message: error.message,
          code: error.code,
          path: '/register' // Required by OpenAPI schema
        }]
      });
    } else {
      console.error('Registration error:', error);
      res.status(500).json({ 
        message: 'Internal server error',
        errors: [{
          message: 'Internal server error',
          code: 'INTERNAL_SERVER_ERROR',
          path: '/register'
        }]
      });
    }
  }
});

// Login
router.post('/login', validateRequest, (req, res, next) => {
  console.log('[Auth] Login attempt received');
  passport.authenticate('local', async (err: Error | null, user: User | false, info: { message: string }) => {
    if (err) {
      console.error('[Auth] Login error:', err);
      return res.status(500).json({
        message: 'Internal server error',
        errors: [{
          message: 'Internal server error',
          code: 'INTERNAL_SERVER_ERROR',
          path: '/login'
        }]
      });
    }

    if (!user) {
      console.log('[Auth] Invalid credentials');
      return res.status(401).json({
        message: info.message,
        errors: [{
          message: info.message,
          code: 'INVALID_CREDENTIALS',
          path: '/login'
        }]
      });
    }

    // Check if user has 2FA enabled
    try {
      console.log(`[Auth] Checking 2FA status for user ${user.id}`);
      const profile = await userService.getUserById(user.id);
      
      if (profile.totpEnabled) {
        console.log(`[Auth] 2FA is enabled for user ${user.id}, requiring verification`);
        // Don't create session yet, return 2FA required response
        return res.status(200).json({
          requiresTwoFactor: true,
          userId: user.id,
          message: 'Two-factor authentication required',
          errors: []
        });
      }

      console.log(`[Auth] 2FA not enabled for user ${user.id}, proceeding with login`);
      // No 2FA required, proceed with normal login
      req.logIn(user, async (err) => {
        if (err) {
          console.error('[Auth] Session error:', err);
          return res.status(500).json({
            message: 'Failed to create session',
            errors: [{
              message: 'Failed to create session',
              code: 'SESSION_ERROR',
              path: '/login'
            }]
          });
        }

        console.log(`[Auth] Login successful for user ${user.id}`);
        return res.json({ 
          user: profile,
          requiresTwoFactor: false,
          message: 'Login successful',
          errors: []
        });
      });
    } catch (error) {
      console.error('[Auth] Profile error:', error);
      return res.status(500).json({
        message: 'Failed to fetch user profile',
        errors: [{
          message: 'Failed to fetch user profile',
          code: 'PROFILE_ERROR',
          path: '/login'
        }]
      });
    }
  })(req, res, next);
});

// 2FA login validation
router.post('/2fa/validate', validateRequest, async (req, res) => {
  const { userId, token, isBackupCode = false } = req.body;
  console.log(`[2FA Validate] Validating login for user ${userId}`);

  try {
    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        errors: [{
          message: 'User not found',
          code: 'USER_NOT_FOUND',
          path: '/2fa/validate'
        }]
      });
    }

    if (!user.totpEnabled) {
      return res.status(400).json({
        message: '2FA is not enabled for this user',
        errors: [{
          message: '2FA is not enabled for this user',
          code: 'TOTP_NOT_ENABLED',
          path: '/2fa/validate'
        }]
      });
    }

    let isValid = false;
    if (isBackupCode) {
      // Validate backup code
      isValid = await totpService.validateBackupCode(user.id, token);
    } else {
      // Validate TOTP token
      isValid = totpService.validateToken(user.totpSecret!, token);
    }

    if (!isValid) {
      return res.status(401).json({
        message: isBackupCode ? 'Invalid backup code' : 'Invalid verification code',
        errors: [{
          message: isBackupCode ? 'Invalid backup code' : 'Invalid verification code',
          code: isBackupCode ? 'INVALID_BACKUP_CODE' : 'INVALID_TOTP_TOKEN',
          path: '/2fa/validate'
        }]
      });
    }

    // Create session after successful 2FA
    req.logIn(user, (err) => {
      if (err) {
        console.error('Session error:', err);
        return res.status(500).json({
          message: 'Failed to create session',
          errors: [{
            message: 'Failed to create session',
            code: 'SESSION_ERROR',
            path: '/2fa/validate'
          }]
        });
      }

      return res.json({ 
        user,
        message: 'Two-factor authentication successful',
        errors: []
      });
    });
  } catch (error) {
    console.error('[2FA Validate] Error:', error);
    res.status(500).json({
      message: 'Failed to validate 2FA',
      errors: [{
        message: 'Failed to validate 2FA',
        code: 'TOTP_VALIDATE_ERROR',
        path: '/2fa/validate'
      }]
    });
  }
});

// Get current user
router.get('/me', validateSession, async (req, res) => {
  try {
    const user = await userService.getUserById(req.user!.id);
    res.json({ 
      user,
      message: 'User profile retrieved successfully',
      errors: []
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      message: 'Failed to fetch user profile',
      errors: [{
        message: 'Failed to fetch user profile',
        code: 'PROFILE_ERROR',
        path: '/me'
      }]
    });
  }
});

// Logout
router.post('/logout', validateSession, (req, res) => {
  const userId = req.user!.id;
  console.log(`[Auth] User ${userId} logging out`);
  
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({
        message: 'Failed to logout',
        errors: [{
          message: 'Failed to logout',
          code: 'LOGOUT_ERROR',
          path: '/logout'
        }]
      });
    }
    console.log(`[Auth] Successfully logged out user ${userId}`);
    res.status(204).end();
  });
});

// Get users by IDs
router.post('/users/batch', validateSession, async (req, res) => {
  try {
    const { userIds } = req.body;
    if (!Array.isArray(userIds)) {
      return res.status(400).json({
        message: 'userIds must be an array',
        errors: [{
          message: 'userIds must be an array',
          code: 'INVALID_REQUEST',
          path: '/users/batch'
        }]
      });
    }
    
    const users = await userService.getUsersByIds(userIds);
    res.json({ 
      users,
      message: 'Users retrieved successfully',
      errors: []
    });
  } catch (error) {
    console.error('Batch user fetch error:', error);
    res.status(500).json({
      message: 'Failed to fetch users',
      errors: [{
        message: 'Failed to fetch users',
        code: 'FETCH_ERROR',
        path: '/users/batch'
      }]
    });
  }
});

// 2FA setup
router.post('/2fa/setup', 
  validateSession,
  totpSetupLimiter,
  validateRequest,
  async (req, res) => {
  const userId = req.user!.id;
  console.log(`[2FA Setup] Initiating 2FA setup for user ${userId}`);
  
  try {
    const user = await userService.getUserById(userId);
    if (user.totpEnabled) {
      console.log(`[2FA Setup] Failed - 2FA already enabled for user ${userId}`);
      return res.status(400).json({
        message: '2FA is already enabled',
        errors: [{
          message: '2FA is already enabled',
          code: 'TOTP_ALREADY_ENABLED',
          path: '/2fa/setup'
        }]
      });
    }

    console.log(`[2FA Setup] Generating TOTP secret for user ${userId}`);
    const { secret, otpauthUrl, qrCodeUrl } = await totpService.generateTOTP(user.id, user.email);
    const backupCodes = totpService.generateBackupCodes();

    // Store TOTP secret and backup codes in session
    req.session.totpSetup = {
      secret,
      backupCodes,
      userId
    };

    // Save session
    await new Promise<void>((resolve, reject) => {
      req.session.save((err) => {
        if (err) reject(err);
        resolve();
      });
    });

    console.log(`[2FA Setup] Successfully initialized 2FA setup for user ${userId}`);
    res.json({
      qrCodeUrl,
      backupCodes,
      message: '2FA setup initialized successfully',
      errors: []
    });
  } catch (error) {
    console.error('[2FA Setup] Error:', error);
    console.error(`[2FA Setup] Failed to setup 2FA for user ${userId}`);
    res.status(500).json({
      message: 'Failed to setup 2FA',
      errors: [{
        message: 'Failed to setup 2FA',
        code: 'TOTP_SETUP_ERROR',
        path: '/2fa/setup'
      }]
    });
  }
});

// 2FA verification step 1 - verify token
router.post('/2fa/verify', 
  validateSession, 
  totpVerifyLimiter, 
  validateRequest,
  async (req, res) => {
  const userId = req.user!.id;
  console.log(`[2FA Verify] Attempting to verify 2FA token for user ${userId}`);
  
  try {
    const { token } = req.body;
    
    // Check if setup was initiated
    if (!req.session.totpSetup || req.session.totpSetup.userId !== userId) {
      return res.status(400).json({
        message: '2FA setup not initiated',
        errors: [{
          message: '2FA setup not initiated',
          code: 'TOTP_NOT_SETUP',
          path: '/2fa/verify'
        }]
      });
    }

    // Validate token against secret from session
    const isValid = totpService.validateToken(req.session.totpSetup.secret, token);
    if (!isValid) {
      return res.status(400).json({
        message: 'Invalid verification code',
        errors: [{
          message: 'Invalid verification code',
          code: 'INVALID_TOTP_TOKEN',
          path: '/2fa/verify'
        }]
      });
    }

    // Mark token as verified in session
    req.session.totpSetup.tokenVerified = true;
    await new Promise<void>((resolve, reject) => {
      req.session.save((err) => {
        if (err) reject(err);
        resolve();
      });
    });
    
    // Return backup codes for user to save
    console.log(`[2FA Verify] Token verified for user ${userId}, showing backup codes`);
    res.json({
      message: 'Verification successful. Please save your backup codes.',
      backupCodes: req.session.totpSetup.backupCodes,
      requiresBackupConfirmation: true,
      errors: []
    });
  } catch (error) {
    console.error('[2FA Verify] Error:', error);
    if (error instanceof UserError) {
      return res.status(400).json({
        message: error.message,
        errors: [{
          message: error.message,
          code: error.code,
          path: '/2fa/verify'
        }]
      });
    }
    res.status(500).json({
      message: 'Failed to verify 2FA',
      errors: [{
        message: 'Failed to verify 2FA',
        code: 'TOTP_VERIFY_ERROR',
        path: '/2fa/verify'
      }]
    });
  }
});

// 2FA verification step 2 - confirm backup codes
router.post('/2fa/confirm', 
  validateSession, 
  totpVerifyLimiter, 
  validateRequest,
  async (req, res) => {
  const userId = req.user!.id;
  console.log(`[2FA Confirm] Confirming backup codes saved for user ${userId}`);
  
  try {
    // Check if setup was initiated and token was verified
    if (!req.session.totpSetup || !req.session.totpSetup.tokenVerified || req.session.totpSetup.userId !== userId) {
      return res.status(400).json({
        message: 'Token verification required before confirming backup codes',
        errors: [{
          message: 'Token verification required before confirming backup codes',
          code: 'TOKEN_NOT_VERIFIED',
          path: '/2fa/confirm'
        }]
      });
    }

    // Update user in database with TOTP data from session
    const user = await userService.updateUser(userId, {
      totpSecret: req.session.totpSetup.secret,
      backupCodes: req.session.totpSetup.backupCodes,
      totpEnabled: true,
      totpVerifiedAt: new Date()
    });

    // Clear TOTP setup data from session
    delete req.session.totpSetup;
    
    // Update session with new user data
    req.user = user;
    await new Promise<void>((resolve, reject) => {
      req.session.save((err) => {
        if (err) reject(err);
        resolve();
      });
    });
    
    console.log(`[2FA Confirm] Successfully enabled 2FA for user ${userId}`);
    res.json({
      message: '2FA has been enabled successfully',
      errors: []
    });
  } catch (error) {
    console.error('[2FA Confirm] Error:', error);
    if (error instanceof UserError) {
      return res.status(400).json({
        message: error.message,
        errors: [{
          message: error.message,
          code: error.code,
          path: '/2fa/confirm'
        }]
      });
    }
    res.status(500).json({
      message: 'Failed to complete 2FA setup',
      errors: [{
        message: 'Failed to complete 2FA setup',
        code: 'TOTP_SETUP_ERROR',
        path: '/2fa/confirm'
      }]
    });
  }
});

export default router; 