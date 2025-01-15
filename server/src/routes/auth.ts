import express from 'express';
import passport from '../auth/passport.js';
import { createUser } from '../auth/user-service.js';
import { User, UserProfile } from '../auth/types.js';
import { AUTH_MESSAGES } from '../constants/auth.constants.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const user = await createUser(req.body);
    const profile: UserProfile = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt
    };
    res.status(201).json({ user: profile });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(400).json({ message: 'An unknown error occurred' });
    }
  }
});

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err: Error | null, user: User | false, info: { message: string }) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: info.message });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      const profile: UserProfile = {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        deletedAt: user.deletedAt
      };
      return res.json({ user: profile });
    });
  })(req, res, next);
});

// Get user profile
router.get('/me', async (req, res) => {
  const userId = req.query.userId as string;
  if (!userId) {
    return res.status(400).json({ message: AUTH_MESSAGES.MISSING_CREDENTIALS });
  }

  try {
    const user = req.user as User | undefined;
    if (!user) {
      return res.status(401).json({ message: AUTH_MESSAGES.USER_NOT_FOUND });
    }

    const profile: UserProfile = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt
    };
    res.json({ user: profile });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
});

export default router; 