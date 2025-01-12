import { create } from 'zustand';

interface RealtimeState {
  connected: boolean;
  reconnecting: boolean;
  error: Error | null;
  typingUsers: Record<string, Set<string>>;
  presence: Record<string, UserPresence>;
}

interface RealtimeActions {
  setConnected: (status: boolean) => void;
  setReconnecting: (status: boolean) => void;
  setError: (error: Error | null) => void;
  updateTyping: (channelId: string, userId: string) => void;
  updatePresence: (userId: string, status: UserPresence) => void;
  clearTyping: (channelId: string, userId: string) => void;
}

type UserPresence = {
  status: 'online' | 'away' | 'offline' | 'dnd';
  lastSeen?: Date;
};

const initialState: RealtimeState = {
  connected: false,
  reconnecting: false,
  error: null,
  typingUsers: {},
  presence: {}
};

export const useRealtimeStore = create<RealtimeState & RealtimeActions>((set, get) => ({
  ...initialState,

  setConnected: (status) => 
    set({ 
      connected: status,
      reconnecting: false,
      ...(status ? { error: null } : {})
    }),

  setReconnecting: (status) =>
    set({ reconnecting: status }),

  setError: (error) =>
    set({ error, connected: false }),

  updateTyping: (channelId, userId) => {
    set(state => {
      const channelTyping = new Set(state.typingUsers[channelId] || []);
      channelTyping.add(userId);
      
      return {
        typingUsers: {
          ...state.typingUsers,
          [channelId]: channelTyping
        }
      };
    });

    // Clear typing indicator after delay
    setTimeout(() => {
      get().clearTyping(channelId, userId);
    }, 3000);
  },

  clearTyping: (channelId, userId) =>
    set(state => {
      const channelTyping = new Set(state.typingUsers[channelId] || []);
      channelTyping.delete(userId);
      
      return {
        typingUsers: {
          ...state.typingUsers,
          [channelId]: channelTyping
        }
      };
    }),

  updatePresence: (userId, presence) =>
    set(state => ({
      presence: {
        ...state.presence,
        [userId]: presence
      }
    }))
})); 