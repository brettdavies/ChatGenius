import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database';
import { logger } from '../utils/logger';
import { generateId } from '../utils/id';
import https from 'https';

/**
 * Helper function to make HTTPS requests
 */
function httpsRequest(url: string, options: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`Request failed with status ${res.statusCode}: ${data}`));
        } else {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

/**
 * Middleware to sync Auth0 user data with our database
 */
export const syncUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Skip if no auth data
    if (!req.auth?.payload) {
      logger.debug('No auth payload found');
      return next();
    }

    // Log the full auth payload for debugging
    logger.debug('Auth0 payload:', JSON.stringify(req.auth.payload, null, 2));
    
    // Get the access token from the Authorization header
    const accessToken = req.headers.authorization?.split(' ')[1];
    if (!accessToken) {
      logger.error('No access token found');
      return res.status(401).json({ error: 'No access token provided' });
    }

    // Fetch user info from Auth0
    const userInfo = await httpsRequest('https://dev-qshac8qsfsfw08iv.us.auth0.com/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    logger.debug('Auth0 user info:', userInfo);

    // Extract user data from userinfo response
    const auth0Id = userInfo.sub;
    const email = userInfo.email;
    const nickname = userInfo.nickname;
    const name = userInfo.name || nickname || email?.split('@')[0];
    const picture = userInfo.picture;

    // Skip if we don't have required user data
    if (!auth0Id || !email) {
      logger.error('Missing required user data:', { auth0Id, email });
      return res.status(400).json({ error: 'Missing required user data' });
    }

    // Generate ID for new users
    const userId = generateId();
    
    logger.debug('Syncing user:', { auth0Id, email, name, nickname });
    
    const result = await pool.query(
      'SELECT sync_auth0_user($1, $2, $3, $4, $5, $6) as user_id',
      [userId, auth0Id, email, nickname, name, picture]
    );

    const dbUserId = result.rows[0].user_id;
    
    // Attach user data to request
    req.user = {
      db_id: dbUserId,
      auth0_id: auth0Id,
      email: email,
      username: nickname,
      full_name: name,
      avatar_url: picture,
      email_verified: userInfo.email_verified
    };

    logger.debug('User synced successfully:', { dbUserId });
    next();
  } catch (error) {
    logger.error('Error syncing user:', error);
    // Stop the request chain on error
    return res.status(500).json({ error: 'Failed to sync user' });
  }
}; 