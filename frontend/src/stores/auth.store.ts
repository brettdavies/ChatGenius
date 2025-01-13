import { create } from 'zustand';
import { User } from '@/types/user.types';
import { apiService } from '@/services/api.service';

interface AuthState {
  user: User | null;
  isInitialized: boolean;
  error: string | null;
  syncUser: () => Promise<void>;
  setUser: (user: User) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isInitialized: false,
  error: null,

  syncUser: async () => {
    try {
      const user = await apiService.post<User>('/api/auth/sync');
      set({ user, isInitialized: true, error: null });
    } catch (error) {
      set({ error: 'Failed to sync user data', isInitialized: true });
      console.error('Error syncing user:', error);
    }
  },

  setUser: (user) => {
    set({ user, isInitialized: true, error: null });
  },

  reset: () => {
    set({ user: null, isInitialized: false, error: null });
  },
})); 