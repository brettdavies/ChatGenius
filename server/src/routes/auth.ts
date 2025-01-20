import express from 'express';
import passport from '../auth/passport.js';
import { UserService, UserError } from '../services/user-service.js';
import { User } from '../auth/types.js';
import { validateRequest } from '../middleware/validate-request.js';
import { TOTPService } from '../services/totp-service.js';
import { validateSession, isAuthenticated } from '../middleware/auth.js';
import { totpSetupLimiter, totpVerifyLimiter, totpValidateLimiter } from '../middleware/rate-limit.js';
import { sendResponse, sendError } from '../utils/response.utils.js';

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
        return sendError(res, 'Failed to create session', 'SESSION_ERROR', [{
          message: 'Failed to create session',
          code: 'SESSION_ERROR',
          path: '/register'
        }], 500);
      }

      return sendResponse(res, 'User registered successfully', 'USER_REGISTERED', { user }, 201);
    });
  } catch (error: unknown) {
    if (error instanceof UserError) {
      sendError(res, error.message, error.code, [{
        message: error.message,
        code: error.code,
        path: '/register'
      }], 400);
    } else {
      console.error('Registration error:', error);
      sendError(res, 'Internal server error', 'INTERNAL_SERVER_ERROR', [{
        message: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
        path: '/register'
      }], 500);
    }
  }
});

// Login
router.post('/login', validateRequest, (req, res, next) => {
  console.log('[Auth] Login attempt received');
  passport.authenticate('local', async (err: Error | null, user: User | false, info: { message: string }) => {
    if (err) {
      console.error('[Auth] Login error:', err);
      return sendError(res, 'Internal server error', 'INTERNAL_SERVER_ERROR', [{
        message: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
        path: '/login'
      }], 500);
    }

    if (!user) {
      console.log('[Auth] Invalid credentials');
      return sendError(res, info.message, 'INVALID_CREDENTIALS', [{
        message: info.message,
        code: 'INVALID_CREDENTIALS',
        path: '/login'
      }], 401);
    }

    // Check if user has 2FA enabled
    try {
      console.log(`[Auth] Checking 2FA status for user ${user.id}`);
      const profile = await userService.getUserById(user.id);
      
      if (profile.totpEnabled) {
        console.log(`[Auth] 2FA is enabled for user ${user.id}, requiring verification`);
        // Don't create session yet, return 2FA required response
        return sendResponse(res, 'Two-factor authentication required', 'TOTP_REQUIRED', {
          requiresTwoFactor: true,
          userId: user.id
        });
      }

      console.log(`[Auth] 2FA not enabled for user ${user.id}, proceeding with login`);
      // No 2FA required, proceed with normal login
      req.logIn(user, async (err) => {
        if (err) {
          console.error('[Auth] Session error:', err);
          return sendError(res, 'Failed to create session', 'SESSION_ERROR', [{
            message: 'Failed to create session',
            code: 'SESSION_ERROR',
            path: '/login'
          }], 500);
        }

        console.log(`[Auth] Login successful for user ${user.id}`);
        return sendResponse(res, 'Login successful', 'LOGIN_SUCCESS', {
          user: profile,
          requiresTwoFactor: false
        });
      });
    } catch (error) {
      console.error('[Auth] Profile error:', error);
      return sendError(res, 'Failed to fetch user profile', 'PROFILE_ERROR', [{
        message: 'Failed to fetch user profile',
        code: 'PROFILE_ERROR',
        path: '/login'
      }], 500);
    }
  })(req, res, next);
});

// 2FA login validation
router.post('/2fa/validate', isAuthenticated, validateSession, totpValidateLimiter, async (req, res) => {
  const { userId, token, isBackupCode = false } = req.body;
  console.log(`[2FA Validate] Validating login for user ${userId}`);

  try {
    const user = await userService.getUserById(userId);
    if (!user) {
      return sendError(res, 'User not found', 'USER_NOT_FOUND', [{
        message: 'User not found',
        code: 'USER_NOT_FOUND',
        path: '/2fa/validate'
      }], 404);
    }

    if (!user.totpEnabled) {
      return sendError(res, '2FA is not enabled for this user', 'TOTP_NOT_ENABLED', [{
        message: '2FA is not enabled for this user',
        code: 'TOTP_NOT_ENABLED',
        path: '/2fa/validate'
      }], 400);
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
      return sendError(res, 
        isBackupCode ? 'Invalid backup code' : 'Invalid verification code',
        isBackupCode ? 'INVALID_BACKUP_CODE' : 'INVALID_TOTP_TOKEN',
        [{
          message: isBackupCode ? 'Invalid backup code' : 'Invalid verification code',
          code: isBackupCode ? 'INVALID_BACKUP_CODE' : 'INVALID_TOTP_TOKEN',
          path: '/2fa/validate'
        }],
        401
      );
    }

    // Create session after successful 2FA
    req.logIn(user, (err) => {
      if (err) {
        console.error('Session error:', err);
        return sendError(res, 'Failed to create session', 'SESSION_ERROR', [{
          message: 'Failed to create session',
          code: 'SESSION_ERROR',
          path: '/2fa/validate'
        }], 500);
      }

      return sendResponse(res, 'Two-factor authentication successful', 'TOTP_VALIDATED', { user });
    });
  } catch (error) {
    console.error('[2FA Validate] Error:', error);
    sendError(res, 'Failed to validate 2FA', 'TOTP_VALIDATE_ERROR', [{
      message: 'Failed to validate 2FA',
      code: 'TOTP_VALIDATE_ERROR',
      path: '/2fa/validate'
    }], 500);
  }
});

// Get current user
router.get('/me', validateSession, async (req, res) => {
  try {
    const user = await userService.getUserById(req.user!.id);
    sendResponse(res, 'User profile retrieved successfully', 'PROFILE_RETRIEVED', { user });
  } catch (error) {
    console.error('Get user error:', error);
    sendError(res, 'Failed to fetch user profile', 'PROFILE_ERROR', [{
      message: 'Failed to fetch user profile',
      code: 'PROFILE_ERROR',
      path: '/me'
    }], 500);
  }
});

// Logout
router.post('/logout', validateSession, (req, res) => {
  const userId = req.user!.id;
  console.log(`[Auth] User ${userId} logging out`);
  
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return sendError(res, 'Failed to logout', 'LOGOUT_ERROR', [{
        message: 'Failed to logout',
        code: 'LOGOUT_ERROR',
        path: '/logout'
      }], 500);
    }
    console.log(`[Auth] Successfully logged out user ${userId}`);
    sendResponse(res, 'Successfully logged out', 'LOGOUT_SUCCESS');
  });
});

// Get users by IDs
router.post('/users/batch', validateSession, async (req, res) => {
  try {
    const { userIds } = req.body;
    if (!Array.isArray(userIds)) {
      return sendError(res, 'userIds must be an array', 'INVALID_REQUEST', [{
        message: 'userIds must be an array',
        code: 'INVALID_REQUEST',
        path: '/users/batch'
      }], 400);
    }
    
    const users = await userService.getUsersByIds(userIds);
    sendResponse(res, 'Users retrieved successfully', 'USERS_RETRIEVED', { users });
  } catch (error) {
    console.error('Batch user fetch error:', error);
    sendError(res, 'Failed to fetch users', 'FETCH_ERROR', [{
      message: 'Failed to fetch users',
      code: 'FETCH_ERROR',
      path: '/users/batch'
    }], 500);
  }
});

// 2FA setup
router.post('/2fa/setup', isAuthenticated, validateSession, totpSetupLimiter, validateRequest, async (req, res) => {
  const userId = req.user!.id;
  console.log(`[2FA Setup] Initiating 2FA setup for user ${userId}`);
  
  try {
    const user = await userService.getUserById(userId);
    if (user.totpEnabled) {
      console.log(`[2FA Setup] Failed - 2FA already enabled for user ${userId}`);
      return sendError(res, '2FA is already enabled', 'TOTP_ALREADY_ENABLED', [{
        message: '2FA is already enabled',
        code: 'TOTP_ALREADY_ENABLED',
        path: '/2fa/setup'
      }], 400);
    }

    console.log(`[2FA Setup] Generating TOTP secret for user ${userId}`);
    const { secret, qrCodeUrl } = await totpService.generateTOTP(user.id, user.email);
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
    sendResponse(res, '2FA setup initialized successfully', 'TOTP_SETUP_INITIALIZED', {
      qrCodeUrl,
      backupCodes
    });
  } catch (error) {
    console.error('[2FA Setup] Error:', error);
    console.error(`[2FA Setup] Failed to setup 2FA for user ${userId}`);
    sendError(res, 'Failed to setup 2FA', 'TOTP_SETUP_ERROR', [{
      message: 'Failed to setup 2FA',
      code: 'TOTP_SETUP_ERROR',
      path: '/2fa/setup'
    }], 500);
  }
});

// 2FA verification
router.post('/2fa/verify', isAuthenticated, validateSession, totpVerifyLimiter, validateRequest, async (req, res) => {
  const { userId, token } = req.body;
  console.log(`[2FA Verify] Attempting to verify 2FA token for user ${userId}`);

  try {
    const user = await userService.getUserById(userId);
    if (!user) {
      return sendError(res, 'User not found', 'USER_NOT_FOUND', [{
        message: 'User not found',
        code: 'USER_NOT_FOUND',
        path: '/2fa/verify'
      }], 404);
    }

    const isValid = totpService.validateToken(user.totpSecret!, token);
    if (!isValid) {
      return sendError(res, 'Invalid verification code', 'INVALID_TOTP_TOKEN', [{
        message: 'Invalid verification code',
        code: 'INVALID_TOTP_TOKEN',
        path: '/2fa/verify'
      }], 401);
    }

    // Update user's TOTP verification status
    await userService.updateUser(userId, { totpVerifiedAt: new Date() });

    sendResponse(res, 'Two-factor authentication verified successfully', 'TOTP_VERIFIED');
  } catch (error) {
    console.error('[2FA Verify] Error:', error);
    sendError(res, 'Failed to verify 2FA', 'TOTP_VERIFY_ERROR', [{
      message: 'Failed to verify 2FA',
      code: 'TOTP_VERIFY_ERROR',
      path: '/2fa/verify'
    }], 500);
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
      return sendError(res, 'Token verification required before confirming backup codes', 'TOKEN_NOT_VERIFIED', [{
        message: 'Token verification required before confirming backup codes',
        code: 'TOKEN_NOT_VERIFIED',
        path: '/2fa/confirm'
      }], 400);
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
    sendResponse(res, '2FA has been enabled successfully', 'TOTP_ENABLED');
  } catch (error) {
    console.error('[2FA Confirm] Error:', error);
    if (error instanceof UserError) {
      return sendError(res, error.message, error.code, [{
        message: error.message,
        code: error.code,
        path: '/2fa/confirm'
      }], 400);
    }
    sendError(res, 'Failed to complete 2FA setup', 'TOTP_SETUP_ERROR', [{
      message: 'Failed to complete 2FA setup',
      code: 'TOTP_SETUP_ERROR',
      path: '/2fa/confirm'
    }], 500);
  }
});

export default router; 