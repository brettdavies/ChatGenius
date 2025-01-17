export interface Channel {
  id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  /** Raw Markdown content of the message */
  content: string;
  userId: string;
  channelId: string;
  threadId?: string;
  parentId?: string;
  replyCount?: number;
  reactions?: Record<string, string[]>;
  createdAt: string;
  updatedAt: string;
  /** When the message was deleted, if it has been deleted */
  deletedAt?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  status?: 'online' | 'offline' | 'away';
  customStatus?: string;
  totpEnabled: boolean;
}

export interface Thread {
  id: string;
  channelId: string;
  parentMessageId: string;
  participantIds: string[];
}

// Store States
export interface ChannelState {
  channels: Channel[];
  activeChannelId: string | null;
  loading: boolean;
  error: string | null;
}

export interface SearchFilters {
  channels: {
    include: string[];
    exclude: string[];
  };
  users: {
    include: string[];
    exclude: string[];
  };
  hasThread?: boolean;
  excludeThread?: boolean;
  dateRange?: {
    before?: string;
    after?: string;
  };
}

export interface MessageState {
  messages: Record<string, Message[]>; // channelId -> messages
  threads: Record<string, Message[]>; // threadId -> messages
  activeThreadId: string | null;
  searchQuery: string;
  searchResults: Message[];
  searchFilters: SearchFilters;
  loading: boolean;
  error: string | null;
}

export interface UserState {
  users: User[];
  currentUser: User | null;
  onlineUsers: Set<string>;
  typingUsers: Record<string, { // channelId -> typing users
    channelTyping: Set<string>; // Set of userIds typing in channel
    threadTyping: Record<string, Set<string>>; // threadId -> Set of userIds typing in thread
  }>;
  loading: boolean;
  error: string | null;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// Store Actions
export interface ChannelActions {
  setChannels: (channels: Channel[]) => void;
  addChannel: (channel: Channel) => void;
  setActiveChannel: (channelId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export interface MessageActions {
  setMessages: (channelId: string, messages: Message[]) => void;
  addMessage: (channelId: string, message: Message) => void;
  updateMessage: (channelId: string, messageId: string, content: string, isThreadMessage?: boolean) => void;
  deleteMessage: (channelId: string, messageId: string, isThreadMessage?: boolean) => void;
  setThreadMessages: (threadId: string, messages: Message[]) => void;
  addThreadMessage: (threadId: string, message: Message) => void;
  addReaction: (channelId: string, messageId: string, emoji: string, userId: string, isThreadMessage?: boolean) => void;
  removeReaction: (channelId: string, messageId: string, emoji: string, userId: string, isThreadMessage?: boolean) => void;
  setActiveThread: (threadId: string | null) => void;
  searchMessages: (query: string) => void;
  clearSearch: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export interface UserActions {
  setUsers: (users: User[]) => void;
  setCurrentUser: (user: User) => void;
  updateUserStatus: (userId: string, status: User['status']) => void;
  setOnlineUsers: (userIds: string[]) => void;
  setTypingStatus: (userId: string, channelId: string, threadId: string | null, isTyping: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export interface AuthActions {
  login: (token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
} 