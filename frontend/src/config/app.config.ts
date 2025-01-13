interface AppConfig {
  name: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
  };
  auth: {
    domain: string;
    clientId: string;
    audience: string;
    scope: string;
  };
  features: {
    enableRealtime: boolean;
    enableNotifications: boolean;
    enableFileUploads: boolean;
  };
}

export const appConfig: AppConfig = {
  name: import.meta.env.VITE_APP_NAME ?? 'ChatGenius',
  version: import.meta.env.VITE_APP_VERSION ?? '1.0.0',
  environment: (import.meta.env.VITE_APP_ENV ?? 'development') as AppConfig['environment'],
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000',
    timeout: 30000, // 30 seconds
    retryAttempts: 3
  },
  auth: {
    domain: import.meta.env.VITE_AUTH0_DOMAIN ?? '',
    clientId: import.meta.env.VITE_AUTH0_CLIENT_ID ?? '',
    audience: import.meta.env.VITE_AUTH0_AUDIENCE ?? '',
    scope: 'openid profile email'
  },
  features: {
    enableRealtime: true,
    enableNotifications: true,
    enableFileUploads: true
  }
}; 