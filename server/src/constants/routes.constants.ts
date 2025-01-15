export const API_BASE = '/api';

export const API_ROUTES = {
  AUTH: `${API_BASE}/auth`,
  COUNTER: `${API_BASE}/counter`,
} as const;

// Sub-routes for each feature
export const AUTH_ROUTES = {
  REGISTER: '/register',
  LOGIN: '/login',
  LOGOUT: '/logout',
  ME: '/me',
  REFRESH: '/refresh',
} as const;

export const COUNTER_ROUTES = {
  ROOT: '/',
  INCREMENT: '/increment',
} as const; 