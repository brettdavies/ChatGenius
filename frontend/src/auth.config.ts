interface AuthConfig {
  domain: string;
  clientId: string;
  sessionTimeoutMinutes: number;
  sessionWarningMinutes: number;
}

// Debug logging
console.log('Auth0 Environment Variables:', {
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
});

export const authConfig: AuthConfig = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN || '',
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || '',
  // Default to test values (2 min timeout, 1 min warning) if env vars not set
  sessionTimeoutMinutes: Number(import.meta.env.VITE_SESSION_TIMEOUT_MINUTES) || 30,
  sessionWarningMinutes: Number(import.meta.env.VITE_SESSION_WARNING_MINUTES) || 5,
}; 