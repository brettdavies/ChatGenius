import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { User, UserState, UserActions } from '../types/store.types';

const initialState: UserState = {
  users: [],
  currentUser: null,
  onlineUsers: new Set<string>(),
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