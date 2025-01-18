import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AuthState, AuthActions } from '../types/auth-store.types';

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false
};

export const useAuthStore = create<AuthState & AuthActions>()(
  devtools(
    (set) => ({
      ...initialState,

      setUser: (user) => set({ user, isAuthenticated: !!user, error: null }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error, loading: false }),
      reset: () => set(initialState),
    }),
    {
      name: 'auth-store',
    }
  )
); 