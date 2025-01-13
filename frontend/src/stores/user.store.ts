import { create } from 'zustand';
import { User, UserPreferences, UserPresence, UserStatus } from '@/types/user.types';

interface UserState {
  currentUser: User | null;
  users: Record<string, User>;
  preferences: UserPreferences | null;
  presenceSubscriptions: Set<string>; // Channel IDs we're subscribed to
  loading: boolean;
  error: Error | null;
}

interface UserActions {
  setCurrentUser: (user: User | null) => void;
  setUsers: (users: User[]) => void;
  updateUser: (userId: string, update: Partial<User>) => void;
  setPreferences: (preferences: UserPreferences | null) => void;
  updatePreferences: (update: Partial<UserPreferences>) => void;
  
  // Presence-related actions
  updateUserPresence: (userId: string, presence: Partial<UserPresence>) => void;
  setUserStatus: (userId: string, status: UserStatus) => void;
  setUserTyping: (userId: string, channelId: string, isTyping: boolean) => void;
  subscribeToPresence: (channelId: string) => void;
  unsubscribeFromPresence: (channelId: string) => void;
  
  setError: (error: Error | null) => void;
  setLoading: (status: boolean) => void;
  reset: () => void;
}

const initialState: UserState = {
  currentUser: null,
  users: {},
  preferences: null,
  presenceSubscriptions: new Set(),
  loading: false,
  error: null,
};

export const useUserStore = create<UserState & UserActions>((set) => ({
  ...initialState,

  setCurrentUser: (user) => set({ currentUser: user }),

  setUsers: (users) => set({ 
    users: users.reduce((acc, user) => ({ ...acc, [user.id]: user }), {})
  }),

  updateUser: (userId, update) => set(state => ({
    users: {
      ...state.users,
      [userId]: { ...state.users[userId], ...update }
    }
  })),

  setPreferences: (preferences) => set({ preferences }),

  updatePreferences: (update) => set(state => ({
    preferences: state.preferences ? { ...state.preferences, ...update } : null
  })),

  // Presence-related actions
  updateUserPresence: (userId, presence) => set(state => {
    const user = state.users[userId];
    if (!user) return state;

    const updatedPresence: UserPresence = {
      status: presence.status ?? user.presence?.status ?? UserStatus.OFFLINE,
      lastActiveAt: presence.lastActiveAt ?? user.presence?.lastActiveAt ?? new Date(),
      currentChannelId: presence.currentChannelId ?? user.presence?.currentChannelId,
      isTyping: presence.isTyping ?? user.presence?.isTyping
    };

    return {
      users: {
        ...state.users,
        [userId]: {
          ...user,
          presence: updatedPresence
        }
      }
    };
  }),

  setUserStatus: (userId, status) => set(state => {
    const user = state.users[userId];
    if (!user) return state;

    const updatedPresence: UserPresence = {
      ...user.presence ?? {},
      status,
      lastActiveAt: new Date()
    };

    return {
      users: {
        ...state.users,
        [userId]: {
          ...user,
          presence: updatedPresence
        }
      }
    };
  }),

  setUserTyping: (userId, channelId, isTyping) => set(state => {
    const user = state.users[userId];
    if (!user) return state;

    const updatedPresence: UserPresence = {
      ...user.presence ?? {
        status: UserStatus.ONLINE,
        lastActiveAt: new Date()
      },
      isTyping: isTyping ? {
        channelId,
        lastTypedAt: new Date()
      } : undefined
    };

    return {
      users: {
        ...state.users,
        [userId]: {
          ...user,
          presence: updatedPresence
        }
      }
    };
  }),

  subscribeToPresence: (channelId) => set(state => ({
    presenceSubscriptions: new Set([...state.presenceSubscriptions, channelId])
  })),

  unsubscribeFromPresence: (channelId) => set(state => {
    const newSubscriptions = new Set(state.presenceSubscriptions);
    newSubscriptions.delete(channelId);
    return { presenceSubscriptions: newSubscriptions };
  }),

  setError: (error) => set({ error }),
  setLoading: (status) => set({ loading: status }),
  reset: () => set(initialState)
})); 