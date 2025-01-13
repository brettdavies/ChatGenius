import { Request, Response, NextFunction } from 'express';
import { UserService } from '@/services/user-service';
import { AuthService } from '@/services/auth-service';
import { httpsRequest } from '@/utils/http';
import { config } from '@/config';

const userService = new UserService();
const authService = AuthService.getInstance();

interface Auth0UserInfo {
  email: string;
  nickname: string;
  name: string;
  picture?: string;
}

export async function syncUser(req: Request, res: Response, next: NextFunction) {
  try {
    // Skip sync in development mode
    if (config.nodeEnv === 'development') {
      const devUser = authService.getCurrentUser(req);
      req.user = await userService.findOrCreateDevUser({
        auth0Id: devUser.sub,
        email: devUser.email || 'dev@example.com',
        username: 'dev_user',
        name: devUser.name || 'Development User',
        picture: devUser.picture || ''
      });
      return next();
    }

    // Skip if no auth payload
    if (!req.auth?.payload) {
      console.log('No auth payload found, skipping sync');
      return next();
    }

    const auth0Id = req.auth.payload.sub;
    if (!auth0Id) {
      throw new Error('No Auth0 ID found in token');
    }
    
    // Check if user already exists and is synced
    const existingUser = await userService.findByAuth0Id(auth0Id);
    if (existingUser) {
      req.user = existingUser;
      return next();
    }

    // First time login - sync user from Auth0
    console.log('First time login detected, syncing user from Auth0');
    
    // Get access token
    const accessToken = req.auth.token;
    if (!accessToken) {
      console.log('No access token found, skipping sync');
      return next();
    }

    // Get user info from Auth0
    const userInfo = await httpsRequest({
      hostname: config.auth0.domain,
      path: '/userinfo',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }) as Auth0UserInfo;

    // Extract user data
    const { email, nickname, name, picture } = userInfo;
    
    if (!email || !nickname || !name) {
      throw new Error('Missing required user info from Auth0');
    }
    
    // Sync user to database
    const user = await userService.syncUser({
      auth0Id,
      email,
      username: nickname,
      name,
      picture: picture || ''
    });

    req.user = user;
    next();
  } catch (error) {
    console.error('Error syncing user:', error);
    next(error);
  }
} 