import { User } from '../types/auth';
import { useAuthStore } from '../stores/auth.store';
import { useChannelStore } from '../stores/channel.store';
import { useUserStore } from '../stores/user.store';
import { useMessageStore } from '../stores/message.store';
import { handleResponse } from './utils';

export interface LoginResponse {
  user?: User;
  requiresTwoFactor?: boolean;
  userId?: string;
  message?: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  console.log('[Auth] Attempting login...');
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ login: email, password }),
  });

  const data = await handleResponse<{ message: string; code: string; data: LoginResponse }>(response);
  console.log('[Auth] Login response:', { 
    requiresTwoFactor: data.data.requiresTwoFactor, 
    hasUser: !!data.data.user,
    userId: data.data.userId 
  });
  return data.data;
}

export interface ValidateTOTPResponse {
  user: User;
  message?: string;
}

export async function validate2FA(userId: string, token: string, isBackupCode = false): Promise<ValidateTOTPResponse> {
  console.log('[Auth] Validating 2FA...', { userId, isBackupCode });
  const response = await fetch('/api/auth/2fa/validate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ userId, token, isBackupCode })
  });

  const data = await handleResponse<{ message: string; code: string; data: ValidateTOTPResponse }>(response);
  console.log('[Auth] 2FA validation response:', { hasUser: !!data.data.user });
  return data.data;
}

export async function register(username: string, email: string, password: string): Promise<User> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, username })
  });

  const data = await handleResponse<{ message: string; code: string; data: { user: User } }>(response);
  return data.data.user;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    // Set loading state
    useUserStore.getState().setLoading(true);

    const response = await fetch('/api/auth/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (response.status === 401) {
      console.log('No authenticated user found');
      return null;
    }

    const data = await handleResponse<{ message: string; code: string; data: { user: User } }>(response);
    const user = data.data.user;
    console.log('Current User ULID:', user.id);
    
    // Update both stores with the user data
    useAuthStore.getState().setUser(user);
    useUserStore.getState().setCurrentUser(user);
    
    return user;
  } catch (error) {
    console.error('Error fetching current user:', error);
    useUserStore.getState().setError(error instanceof Error ? error.message : 'Failed to fetch user');
    return null;
  } finally {
    // Clear loading state
    useUserStore.getState().setLoading(false);
  }
}

export async function logout(): Promise<void> {
  // First, call the logout endpoint
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  await handleResponse<{ message: string; code: string }>(response);

  // Clear all application state
  useAuthStore.getState().reset();
  useChannelStore.getState().reset();
  useUserStore.getState().reset();
  useMessageStore.getState().reset();
} 