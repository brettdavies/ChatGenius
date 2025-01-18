export interface User {
  // Core properties from API
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  totpEnabled: boolean;
  avatar_url?: string;
  
  // UI-specific properties
  status?: 'online' | 'offline' | 'away';
  customStatus?: string;
} 