import { Auth0Provider, AppState } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { authConfig } from './auth.config';

interface Auth0ProviderWithNavigateProps {
  children: React.ReactNode;
}

const Auth0ProviderWithNavigate = ({ children }: Auth0ProviderWithNavigateProps) => {
  const navigate = useNavigate();

  const onRedirectCallback = (appState?: AppState) => {
    console.log('=== Auth0 Debug Info ===');
    console.log('Redirect Callback Triggered');
    console.log('App State:', appState);
    console.log('Current Location:', window.location.pathname);
    console.log('Origin:', window.location.origin);
    console.log('Full URL:', window.location.href);
    
    navigate(appState?.returnTo || window.location.pathname);
  };

  return (
    <Auth0Provider
      domain={authConfig.domain}
      clientId={authConfig.clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        scope: 'openid profile email offline_access',
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};

export default Auth0ProviderWithNavigate;
