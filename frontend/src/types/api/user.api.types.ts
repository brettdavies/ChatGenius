import { UserRole, UserStatus, UserPresenceEvent } from '../user.types';

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar_url?: string;
  bio?: string;
  timezone?: string;
  created_at: string;
  updated_at: string;
  last_seen_at?: string;
  presence?: ApiUserPresence;
}

export interface ApiUserPresence {
  status: UserStatus;
  last_active_at: string;
  current_channel_id?: string;
  is_typing?: {
    channel_id: string;
    last_typed_at: string;
  };
}

export interface ApiUserPresenceEvent {
  type: UserPresenceEvent;
  user_id: string;
  channel_id?: string;
  timestamp: string;
  data?: {
    status?: UserStatus;
    current_channel_id?: string;
    is_typing?: boolean;
  };
}

export interface ApiUserTypingEvent {
  user_id: string;
  channel_id: string;
  started_at: string;
}

export interface ApiUserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
  };
  language: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  role?: UserRole;
  avatar_url?: string;
  bio?: string;
  timezone?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  avatar_url?: string;
  bio?: string;
  timezone?: string;
}

export interface UpdateUserPreferencesRequest {
  theme?: 'light' | 'dark' | 'system';
  notifications?: {
    email?: boolean;
    push?: boolean;
    desktop?: boolean;
  };
  language?: string;
}

export interface UserSearchParams {
  query?: string;
  role?: UserRole;
  status?: UserStatus;
  page?: number;
  limit?: number;
}

export interface UserSearchResponse {
  users: ApiUser[];
  total: number;
  page: number;
  limit: number;
}

export interface UserPresenceSubscription {
  channel_ids: string[];
  user_ids?: string[];
  events?: UserPresenceEvent[];
}

export interface UserPresenceUpdate {
  status?: UserStatus;
  current_channel_id?: string;
  is_typing?: {
    channel_id: string;
    is_typing: boolean;
  };
} 