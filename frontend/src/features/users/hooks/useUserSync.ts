import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

export function useUserSync() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    async function syncUser() {
      if (!isAuthenticated) return;

      try {
        const token = await getAccessTokenSilently();
        const response = await fetch('/api/users/sync', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to sync user: ${response.statusText}`);
        }

        const data = await response.json();
        console.debug('User synced:', data);
      } catch (error) {
        console.error('Error syncing user:', error);
      }
    }

    syncUser();
  }, [isAuthenticated, getAccessTokenSilently]);
} 