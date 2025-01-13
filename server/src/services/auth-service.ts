import { config } from '@/config';
import { UnauthorizedError } from '@/errors';

export interface AuthUser {
  id: string;
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
}

export interface TokenInfo {
  accessToken: string;
  expiresAt: number;
}

export class AuthService {
  private static instance: AuthService;
  private isDevelopment: boolean;
  private devUser?: AuthUser;
  private devToken?: TokenInfo;

  private constructor() {
    this.isDevelopment = config.nodeEnv === 'development';
    
    // Set up dev user and token if in development
    if (this.isDevelopment) {
      this.devUser = {
        id: 'dev-user-123',
        sub: 'auth0|dev-user-123',
        email: 'dev@example.com',
        name: 'Development User',
        picture: 'https://via.placeholder.com/150'
      };
      
      // Create a never-expiring dev token
      this.devToken = {
        accessToken: 'dev-token',
        expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 365 // 1 year
      };
    }
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public getCurrentUser(req: any): AuthUser {
    if (this.isDevelopment && this.devUser) {
      return this.devUser;
    }

    const user = req.user;
    if (!user?.id) {
      throw new UnauthorizedError('User not authenticated');
    }
    return user;
  }

  public getUserId(req: any): string {
    return this.getCurrentUser(req).id;
  }

  public isAuthenticated(req: any): boolean {
    if (this.isDevelopment) {
      return true;
    }
    return !!req.user?.id;
  }

  public getToken(req: any): TokenInfo | undefined {
    if (this.isDevelopment) {
      return this.devToken;
    }
    
    const token = req.auth?.token;
    const decodedToken = req.auth?.payload;
    
    if (!token || !decodedToken?.exp) {
      return undefined;
    }

    return {
      accessToken: token,
      expiresAt: decodedToken.exp * 1000 // Convert to milliseconds
    };
  }

  public isTokenExpired(token: TokenInfo): boolean {
    return Date.now() >= token.expiresAt;
  }

  public getAuthHeaders(token: TokenInfo): Record<string, string> {
    return {
      'Authorization': `Bearer ${token.accessToken}`
    };
  }

  // For testing and development
  public setDevUser(user: AuthUser): void {
    if (this.isDevelopment) {
      this.devUser = user;
    }
  }

  // For testing and development
  public setDevToken(token: TokenInfo): void {
    if (this.isDevelopment) {
      this.devToken = token;
    }
  }
} 