import { User } from '../types/auth';
import { useAuthStore } from '../stores/auth.store';
import { useChannelStore } from '../stores/channel.store';
import { useUserStore } from '../stores/user.store';
import { useMessageStore } from '../stores/message.store';

async function handleResponse(response: Response) {
  if (!response.ok) {
    const data = await response.json();
    // Check for standardized error format
    if (data.errors && data.errors.length > 0) {
      const error = data.errors[0];
      throw new Error(error.message);
    }
    // Fallback to message or status
    throw new Error(data.message || `${response.status} ${response.statusText}`);
  }

  // Return undefined for 204 No Content responses
  if (response.status === 204) {
    return undefined;
  }

  const data = await response.json();
  return data;
}

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
    body: JSON.stringify({ email, password }),
  });

  const data = await handleResponse(response);
  console.log('[Auth] Login response:', { 
    requiresTwoFactor: data.requiresTwoFactor, 
    hasUser: !!data.user,
    userId: data.userId 
  });
  
  // If 2FA is required, return the response without logging user info
  if (data.requiresTwoFactor) {
    console.log('[Auth] 2FA required for user:', data.userId);
    return data;
  }
  
  // Only log user info if 2FA is not required and user is present
  if (data.user) {
    console.log('[Auth] Login successful for user:', data.user.id);
  }
  
  return data;
}

export async function validate2FA(userId: string, token: string, isBackupCode = false): Promise<User> {
  console.log('[Auth] Validating 2FA...', { userId, isBackupCode });
  const response = await fetch('/api/auth/2fa/validate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ userId, token, isBackupCode })
  });

  const data = await handleResponse(response);
  console.log('[Auth] 2FA validation response:', { hasUser: !!data.user });
  return data.user;
}

export async function register(username: string, email: string, password: string): Promise<User> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, username })
  });

  const data = await response.json();
  
  if (!response.ok) {
    // Check if we have errors in the response
    if (data.errors && data.errors.length > 0) {
      const error = data.errors[0];
      throw new Error(error.message);
    }
    // Fallback error
    throw new Error('Registration failed');
  }

  return data.user;
}

export async function getCurrentUser(): Promise<User | null> {
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

  const data = await handleResponse(response);
  console.log('Current User ULID:', data.user.id);
  return data.user;
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

  await handleResponse(response);

  // Clear all application state
  useAuthStore.getState().reset();
  useChannelStore.getState().reset();
  useUserStore.getState().reset();
  useMessageStore.getState().reset();
} 