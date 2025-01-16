import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AuthState, AuthActions } from '../types/store.types';

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  loading: false,
  error: null,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  devtools(
    (set) => ({
      ...initialState,

      login: (token) =>
        set({
          isAuthenticated: true,
          token,
          error: null,
        }),

      logout: () =>
        set({
          isAuthenticated: false,
          token: null,
          error: null,
        }),

      setLoading: (loading) =>
        set({ loading }),

      setError: (error) =>
        set({ error, loading: false }),

      reset: () => set(initialState),
    }),
    {
      name: 'auth-store',
    }
  )
); 