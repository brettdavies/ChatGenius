import { User } from '../types/auth';

const API_URL = import.meta.env.VITE_API_URL;

export async function login(email: string, password: string): Promise<User> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  const { user } = await response.json();
  localStorage.setItem('userId', user.id);
  return user;
}

export async function register(username: string, email: string, password: string): Promise<User> {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  const { user } = await response.json();
  localStorage.setItem('userId', user.id);
  return user;
}

export async function getCurrentUser(): Promise<User | null> {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    return null;
  }

  const response = await fetch(`${API_URL}/api/auth/me?userId=${userId}`);
  if (!response.ok) {
    if (response.status === 404) {
      localStorage.removeItem('userId');
      return null;
    }
    const error = await response.json();
    throw new Error(error.message);
  }

  const { user } = await response.json();
  return user;
}

export function logout(): void {
  localStorage.removeItem('userId');
} 