import { AuthService, AuthUser, TokenInfo } from '@/services/auth-service';

export const authTestScenarios = {
  // User scenarios
  validUser: {
    id: 'test-123',
    sub: 'auth0|test-123',
    email: 'test@example.com',
    name: 'Test User',
    picture: 'https://example.com/pic.jpg'
  } as AuthUser,

  adminUser: {
    id: 'admin-123',
    sub: 'auth0|admin-123',
    email: 'admin@example.com',
    name: 'Admin User',
    picture: 'https://example.com/admin.jpg'
  } as AuthUser,

  incompleteUser: {
    id: 'incomplete-123',
    sub: 'auth0|incomplete-123'
  } as AuthUser,

  // Token scenarios
  validToken: {
    accessToken: 'valid-token',
    expiresAt: Date.now() + 3600000 // 1 hour from now
  } as TokenInfo,

  expiredToken: {
    accessToken: 'expired-token',
    expiresAt: Date.now() - 1000 // 1 second ago
  } as TokenInfo,

  nearExpiryToken: {
    accessToken: 'near-expiry-token',
    expiresAt: Date.now() + 60000 // 1 minute from now
  } as TokenInfo
};

export class AuthTestHelper {
  private authService: AuthService;

  constructor() {
    this.authService = AuthService.getInstance();
  }

  // Set up different user scenarios
  setupValidUser() {
    this.authService.setDevUser(authTestScenarios.validUser);
    this.authService.setDevToken(authTestScenarios.validToken);
  }

  setupAdminUser() {
    this.authService.setDevUser(authTestScenarios.adminUser);
    this.authService.setDevToken(authTestScenarios.validToken);
  }

  setupIncompleteUser() {
    this.authService.setDevUser(authTestScenarios.incompleteUser);
    this.authService.setDevToken(authTestScenarios.validToken);
  }

  // Set up different token scenarios
  setupExpiredToken() {
    this.authService.setDevToken(authTestScenarios.expiredToken);
  }

  setupNearExpiryToken() {
    this.authService.setDevToken(authTestScenarios.nearExpiryToken);
  }

  // Set up error scenarios
  setupUnauthenticated() {
    this.authService.setDevUser(undefined);
    this.authService.setDevToken(undefined);
  }

  setupMalformedToken() {
    this.authService.setDevToken({
      accessToken: 'malformed.jwt.token',
      expiresAt: Date.now() + 3600000
    });
  }

  // Reset to default state
  reset() {
    this.authService.setDevUser(undefined);
    this.authService.setDevToken(undefined);
  }
} 