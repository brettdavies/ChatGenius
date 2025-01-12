import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database';
import { logger } from '../utils/logger';

export async function syncUser(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return next();
    }

    const { sub: auth0Id, email, name, picture } = req.user;

    const result = await pool.query(
      `SELECT * FROM sync_auth0_user($1, $2, $3, $4, $5)`,
      [auth0Id, email, email.split('@')[0], name, picture]
    );

    const dbUser = result.rows[0];
    if (!dbUser) {
      throw new Error('Failed to sync user');
    }

    // Attach database user info to request
    req.user = {
      auth0_id: auth0Id,
      db_id: dbUser.id,
      email: dbUser.email,
      username: dbUser.username,
      full_name: dbUser.full_name,
      avatar_url: dbUser.avatar_url
    };

    next();
  } catch (error) {
    logger.error('Error syncing user:', error);
    res.status(500).json({ error: 'Failed to sync user' });
  }
} 