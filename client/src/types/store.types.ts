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
  content: string;
  userId: string;
  channelId: string;
  threadId?: string;
  parentId?: string;
  replyCount?: number;
  reactions?: Record<string, string[]>;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  status?: 'online' | 'offline' | 'away';
  customStatus?: string;
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

export interface MessageState {
  messages: Record<string, Message[]>; // channelId -> messages
  threads: Record<string, Message[]>; // threadId -> messages
  activeThreadId: string | null;
  loading: boolean;
  error: string | null;
}

export interface UserState {
  users: User[];
  currentUser: User | null;
  onlineUsers: Set<string>;
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
  setThreadMessages: (threadId: string, messages: Message[]) => void;
  addThreadMessage: (threadId: string, message: Message) => void;
  setActiveThread: (threadId: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export interface UserActions {
  setUsers: (users: User[]) => void;
  setCurrentUser: (user: User) => void;
  updateUserStatus: (userId: string, status: User['status']) => void;
  setOnlineUsers: (userIds: string[]) => void;
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