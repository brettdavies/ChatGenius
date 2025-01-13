export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest'
}

export enum UserStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  AWAY = 'away',
  DO_NOT_DISTURB = 'do_not_disturb'
}

export enum UserPresenceEvent {
  STATUS_CHANGED = 'user.status_changed',
  TYPING_STARTED = 'user.typing_started',
  TYPING_STOPPED = 'user.typing_stopped',
  JOINED_CHANNEL = 'user.joined_channel',
  LEFT_CHANNEL = 'user.left_channel'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  bio?: string;
  timezone?: string;
  createdAt: Date;
  updatedAt: Date;
  lastSeenAt?: Date;
  presence?: UserPresence;
}

export interface UserPresence {
  status: UserStatus;
  lastActiveAt: Date;
  currentChannelId?: string;
  isTyping?: {
    channelId: string;
    lastTypedAt: Date;
  };
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
  };
  language: string;
} 