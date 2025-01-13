import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { PanelLayout } from '@/features/layout/panel-layout/PanelLayout';
import { NavigationPanel } from '@/components/navigation/NavigationPanel';
import { ChannelView } from '@/components/channels/ChannelView';
import { ThreadView } from '@/components/threads/ThreadView';
import { ProfileView } from '@/components/profile/ProfileView';

export const App: React.FC = () => {
  const { isAuthenticated, isLoading, login } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <PanelLayout
                navigation={<NavigationPanel />}
                main={<Outlet />}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        >
          <Route path=":channelId" element={<ChannelView />}>
            <Route path="thread/:threadId" element={<ThreadView />} />
          </Route>
          <Route path="profile" element={<ProfileView />} />
        </Route>
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <button
                  onClick={() => login()}
                  className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  Click here to login
                </button>
              </div>
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
};
