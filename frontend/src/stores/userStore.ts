import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  title?: string;
  timezone?: string;
}

interface UserState {
  users: Record<string, User>;
  loading: boolean;
  error: Error | null;
}

interface UserActions {
  setUser: (user: User) => void;
  setUsers: (users: User[]) => void;
  removeUser: (userId: string) => void;
  setError: (error: Error | null) => void;
  setLoading: (status: boolean) => void;
}

const initialState: UserState = {
  users: {},
  loading: false,
  error: null
};

export const useUserStore = create<UserState & UserActions>((set) => ({
  ...initialState,

  setUser: (user) =>
    set(state => ({
      users: { ...state.users, [user.id]: user }
    })),

  setUsers: (users) =>
    set(state => ({
      users: {
        ...state.users,
        ...Object.fromEntries(users.map(user => [user.id, user]))
      }
    })),

  removeUser: (userId) =>
    set((state) => {
      const newUsers = { ...state.users };
      delete newUsers[userId];
      return { users: newUsers };
    }),

  setError: (error) => set({ error }),
  
  setLoading: (status) => set({ loading: status })
})); 