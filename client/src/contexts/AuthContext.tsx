import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginCredentials, RegisterCredentials } from '../types/auth';
import * as authService from '../services/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const user = await authService.getCurrentUser();
      setUser(user);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load user');
    } finally {
      setLoading(false);
    }
  }

  async function login(credentials: LoginCredentials) {
    try {
      setError(null);
      const user = await authService.login(credentials.email, credentials.password);
      setUser(user);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
      throw error;
    }
  }

  async function register(credentials: RegisterCredentials) {
    try {
      setError(null);
      const user = await authService.register(
        credentials.username,
        credentials.email,
        credentials.password
      );
      setUser(user);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
      throw error;
    }
  }

  function logout() {
    authService.logout();
    setUser(null);
  }

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 