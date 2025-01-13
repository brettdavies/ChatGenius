export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
  } as const;
  
  export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    CALLBACK: '/auth/callback'
  },
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    PREFERENCES: '/users/preferences',
    ME: '/users/me',
    PRESENCE: {
      UPDATE: '/users/presence',
      SUBSCRIBE: (channelId: string) => `/users/presence/${channelId}`
    }
  },
  CHANNELS: {
    BASE: '/channels',
    MESSAGES: (channelId: string) => `/channels/${channelId}/messages`,
    MEMBERS: (channelId: string) => `/channels/${channelId}/members`,
    THREADS: (channelId: string) => `/channels/${channelId}/threads`
  },
  MESSAGES: {
    BASE: '/messages',
    THREAD: (messageId: string) => `/messages/${messageId}/thread`,
    REACTIONS: (messageId: string) => `/messages/${messageId}/reactions`
  },
  THREADS: {
    BASE: '/threads',
    GET: (threadId: string) => `/threads/${threadId}`,
    REPLY: (threadId: string) => `/threads/${threadId}/replies`
  }
} as const;
