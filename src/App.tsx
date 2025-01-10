import { Auth0Provider } from '@auth0/auth0-react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { authConfig } from './auth.config';
import RootLayout from './layouts/RootLayout';
import Home from './pages/Home';
import ErrorPage from './pages/ErrorPage';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <BrowserRouter>
      <Auth0Provider
        domain={authConfig.domain}
        clientId={authConfig.clientId}
        authorizationParams={{
          redirect_uri: window.location.origin,
          scope: 'openid profile email offline_access',
        }}
        useRefreshTokens={true}
        cacheLocation="localstorage"
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <RootLayout />
              </ProtectedRoute>
            }
            errorElement={<ErrorPage />}
          >
            <Route index element={<Home />} />
          </Route>
        </Routes>
      </Auth0Provider>
    </BrowserRouter>
  );
};

export default App;
