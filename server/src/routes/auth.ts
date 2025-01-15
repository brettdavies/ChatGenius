import express, { Request, Response } from 'express';
import { AuthError } from '@auth/user-service';
import * as userService from '@auth/user-service';
import { AUTH_ERRORS, AUTH_MESSAGES, TOKEN_CONFIG, AUTH_ROUTES } from '@constants/auth.constants';
import { requireAuth, optionalAuth } from '@auth/middleware';
import { rateLimiters } from '@config/security';

const router = express.Router();

// Register route - Add rate limiting to prevent spam
router.post(AUTH_ROUTES.REGISTER, rateLimiters.auth, async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const user = await userService.createUser({ username, email, password });
    const tokens = await userService.generateAuthTokens(user);

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', tokens.refreshToken, TOKEN_CONFIG.COOKIE_OPTIONS);

    res.status(201).json({
      message: 'User registered successfully',
      user,
      accessToken: tokens.accessToken
    });
  } catch (error) {
    if (error instanceof AuthError) {
      console.error('Auth error during registration:', error.message, error.code);
      return res.status(400).json({ 
        message: error.message,
        code: error.code 
      });
    }
    if (error instanceof Error) {
      console.error('Unexpected registration error:', error.stack);
    } else {
      console.error('Unexpected registration error:', error);
    }
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Login route - Add exponential backoff rate limiting
router.post(AUTH_ROUTES.LOGIN, rateLimiters.auth, async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const user = await userService.validateCredentials(username, password);
    const tokens = await userService.generateAuthTokens(user);

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', tokens.refreshToken, TOKEN_CONFIG.COOKIE_OPTIONS);

    res.status(200).json({
      message: 'Login successful',
      user,
      accessToken: tokens.accessToken
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(401).json({ 
        message: error.message,
        code: error.code 
      });
    }
    if (error instanceof Error) {
      console.error('Login error:', error.stack);
    } else {
      console.error('Login error:', error);
    }
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Refresh token route - Add rate limiting and track token reuse
router.post(AUTH_ROUTES.REFRESH, optionalAuth, rateLimiters.api, async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        message: AUTH_MESSAGES[AUTH_ERRORS.REFRESH_TOKEN_INVALID],
        code: AUTH_ERRORS.REFRESH_TOKEN_INVALID
      });
    }

    // If user is already authenticated, this might be a token reuse attempt
    if (req.user) {
      await userService.revokeRefreshToken(refreshToken, 'Potential token reuse detected');
      return res.status(401).json({
        message: AUTH_MESSAGES[AUTH_ERRORS.REFRESH_TOKEN_INVALID],
        code: AUTH_ERRORS.REFRESH_TOKEN_INVALID
      });
    }

    const tokens = await userService.refreshAccessToken(refreshToken);
    
    res.status(200).json(tokens);
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(401).json({ 
        message: error.message,
        code: error.code 
      });
    }
    if (error instanceof Error) {
      console.error('Token refresh error:', error.stack);
    } else {
      console.error('Token refresh error:', error);
    }
    res.status(500).json({ message: 'Error refreshing token' });
  }
});

// Logout route - Already uses requireAuth
router.post(AUTH_ROUTES.LOGOUT, requireAuth, async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await userService.revokeRefreshToken(refreshToken, 'User logout');
    }

    // Clear the refresh token cookie
    res.clearCookie('refreshToken', TOKEN_CONFIG.COOKIE_OPTIONS);

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Error logging out' });
  }
});

// Get current user - Already uses requireAuth
router.get(AUTH_ROUTES.ME, requireAuth, (req: Request, res: Response) => {
  res.json({ user: req.user });
});

export default router; 