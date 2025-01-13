export interface SessionConfig {
  timeout: number; // in milliseconds
  warningTime: number; // in milliseconds
  refreshInterval: number; // in milliseconds
}

export const sessionConfig: SessionConfig = {
  timeout: (import.meta.env.VITE_SESSION_TIMEOUT_MINUTES ?? 30) * 60 * 1000,
  warningTime: (import.meta.env.VITE_SESSION_WARNING_MINUTES ?? 5) * 60 * 1000,
  refreshInterval: 5 * 60 * 1000 // 5 minutes
}; 