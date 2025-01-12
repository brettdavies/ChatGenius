import React from 'react';
import type { FC } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { PanelLayout } from './components/PanelLayout';
import { NavigationPanel } from './components/NavigationPanel';
import { ChannelView } from './components/ChannelView';
import { ThreadView } from './components/ThreadView';
import { ProfileView } from './components/ProfileView';

const App: FC = () => {
  const { isAuthenticated, isLoading, loginWithRedirect, error } = useAuth0();

  // Auto-redirect to Auth0 login if not authenticated
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect().catch((err: Error) => {
        console.error('Failed to redirect to Auth0:', err);
      });
    }
  }, [isLoading, isAuthenticated, loginWithRedirect]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center text-red-500">
          <p>Authentication Error</p>
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  // Don't render anything while redirecting to Auth0
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to default workspace */}
        <Route path="/" element={<Navigate to="/client/default" replace />} />

        {/* Main client routes */}
        <Route
          path="/client/:workspaceId"
          element={
            <PanelLayout
              navigation={<NavigationPanel />}
              main={<Outlet />}
            />
          }
        >
          {/* Default channel route */}
          <Route index element={<Navigate to="channel/general" replace />} />

          {/* Channel routes */}
          <Route path="channel/:channelId" element={<ChannelView />}>
            {/* Thread route as a child of channel */}
            <Route path="thread/:threadId" element={<ThreadView />} />
          </Route>

          {/* User profile route */}
          <Route path="user/:userId" element={<ProfileView />} />
        </Route>

        {/* Catch all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
