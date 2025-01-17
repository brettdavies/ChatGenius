import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { User, UserState, UserActions } from '../types/store.types';

const initialState: UserState = {
  users: [],
  currentUser: null,
  onlineUsers: new Set<string>(),
  typingUsers: {},
  loading: false,
  error: null,
};

export const useUserStore = create<UserState & UserActions>()(
  devtools(
    (set) => ({
      ...initialState,

      setUsers: (users) =>
        set({ users, error: null }),

      setCurrentUser: (user) =>
        set({ currentUser: user, error: null }),

      updateUserStatus: (userId, status) =>
        set((state) => ({
          users: state.users.map((user) =>
            user.id === userId ? { ...user, status } : user
          ),
          error: null,
        })),

      setOnlineUsers: (userIds) =>
        set({ onlineUsers: new Set(userIds), error: null }),

      setTypingStatus: (userId, channelId, threadId, isTyping) =>
        set((state) => {
          const channelTyping = state.typingUsers[channelId]?.channelTyping || new Set<string>();
          const threadTyping = state.typingUsers[channelId]?.threadTyping || {};

          // Update channel typing status
          if (!threadId) {
            if (isTyping) {
              channelTyping.add(userId);
            } else {
              channelTyping.delete(userId);
            }
          }
          // Update thread typing status
          else {
            const threadTypingUsers = threadTyping[threadId] || new Set<string>();
            if (isTyping) {
              threadTypingUsers.add(userId);
            } else {
              threadTypingUsers.delete(userId);
            }
            threadTyping[threadId] = threadTypingUsers;
          }

          return {
            ...state,
            typingUsers: {
              ...state.typingUsers,
              [channelId]: {
                channelTyping,
                threadTyping,
              },
            },
          };
        }),

      setLoading: (loading) =>
        set({ loading }),

      setError: (error) =>
        set({ error, loading: false }),

      reset: () => set(initialState),
    }),
    {
      name: 'user-store',
    }
  )
); 