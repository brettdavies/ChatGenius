import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginCredentials, RegisterCredentials } from '../types/auth';
import * as authService from '../services/auth';
import { useAuthStore } from '../stores/auth.store';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<{ requiresTwoFactor?: boolean; userId?: string }>;
  validate2FA: (userId: string, token: string, isBackupCode?: boolean) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore((state) => ({ 
    user: state.user
  }));

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      await authService.getCurrentUser();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load user');
    } finally {
      setLoading(false);
    }
  }

  async function login(credentials: LoginCredentials) {
    try {
      setError(null);
      const response = await authService.login(credentials.email, credentials.password);
      
      if (response.requiresTwoFactor) {
        return {
          requiresTwoFactor: true,
          userId: response.userId
        };
      }

      return { requiresTwoFactor: false };
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
      throw error;
    }
  }

  async function validate2FA(userId: string, token: string, isBackupCode = false) {
    try {
      setError(null);
      await authService.validate2FA(userId, token, isBackupCode);
    } catch (error) {
      setError(error instanceof Error ? error.message : '2FA validation failed');
      throw error;
    }
  }

  async function register(credentials: RegisterCredentials) {
    try {
      setError(null);
      await authService.register(
        credentials.username,
        credentials.email,
        credentials.password
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
      throw error;
    }
  }

  function logout() {
    authService.logout();
  }

  const value = {
    user,
    loading,
    error,
    login,
    validate2FA,
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