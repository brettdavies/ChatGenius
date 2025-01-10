interface AuthConfig {
  domain: string;
  clientId: string;
}

export const authConfig: AuthConfig = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN || '',
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || '',
}; 