import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';

const Home = () => {
  const { isAuthenticated, isLoading, error, user, getAccessTokenSilently } = useAuth0();
  
  useEffect(() => {
    const logAuthState = async () => {
      console.log('=== Auth0 State in Home ===');
      console.log('Is Authenticated:', isAuthenticated);
      console.log('Is Loading:', isLoading);
      console.log('Error:', error);
      console.log('User:', user);
      
      try {
        const token = await getAccessTokenSilently();
        console.log('Access Token Available:', !!token);
        console.log('Token Length:', token?.length);
      } catch (e) {
        console.log('Token Error:', e);
      }

      // Log localStorage keys
      console.log('LocalStorage Keys:', Object.keys(localStorage));
      
      // Log all auth-related items in localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.includes('auth0') || key.includes('token')) {
          console.log(`LocalStorage Item ${key}:`, localStorage.getItem(key));
        }
      });
    };

    logAuthState();
  }, [isAuthenticated, isLoading, error, user, getAccessTokenSilently]);
  
  return (
    <div className="prose lg:prose-xl mx-auto">
      <h1>Welcome to ChatGenius</h1>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.name || 'User'}</p>
          <p>You are now authenticated</p>
          {user?.email && <p>{user.email}</p>}
        </div>
      ) : (
        <div>
          <p>Please log in to continue</p>
        </div>
      )}
      {error && (
        <p className="text-red-500">
          Error: {error.message}
        </p>
      )}
    </div>
  );
};

export default Home; 