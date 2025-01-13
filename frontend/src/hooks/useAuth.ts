import { useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { LOCAL_STORAGE_KEYS } from '@/constants';

export const useAuth = () => {
  const {
    isAuthenticated,
    isLoading,
    getAccessTokenSilently,
    loginWithRedirect,
    logout,
    user
  } = useAuth0();

  const setAuthToken = useCallback(async () => {
    try {
      const token = await getAccessTokenSilently();
      localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Failed to get access token:', error);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
    }
  }, [getAccessTokenSilently]);

  useEffect(() => {
    if (isAuthenticated) {
      setAuthToken();
    }
  }, [isAuthenticated, setAuthToken]);

  return {
    isAuthenticated,
    isLoading,
    user,
    login: loginWithRedirect,
    logout: () => {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
      logout({ returnTo: window.location.origin });
    }
  };
}; 