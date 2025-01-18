import { User } from './user.types';

export interface UserState {
  users: User[];
  currentUser: User | null;
  onlineUsers: Set<string>;
  typingUsers: {
    [channelId: string]: {
      channelTyping: Set<string>;
      threadTyping: {
        [threadId: string]: Set<string>;
      };
    };
  };
  loading: boolean;
  error: string | null;
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