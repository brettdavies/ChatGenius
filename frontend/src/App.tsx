import { FC, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserStore } from '@/stores/user.store';
import { themeConfig } from '@/config';
import { LOCAL_STORAGE_KEYS } from '@/constants';
import { ChannelView } from '@/components/channels/ChannelView';
import { ThreadView } from '@/components/threads/ThreadView';
import { NavigationPanel } from '@/components/navigation/NavigationPanel';

const LandingPage: FC = () => {
  const { login, isAuthenticated } = useAuth();

  // If already authenticated, redirect to default channel
  if (isAuthenticated) {
    return <Navigate to="/0000000001" replace />;
  }

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Failed to login:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-white">Welcome to ChatGenius</h1>
        <p className="text-xl text-gray-300">Connect and collaborate with your team</p>
        <button
          onClick={handleLogin}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Click here to login
        </button>
      </div>
    </div>
  );
};

const ProtectedRoute: FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { preferences } = useUserStore();

  useEffect(() => {
    // Set theme based on user preferences or system default
    const theme = preferences?.theme ?? localStorage.getItem(LOCAL_STORAGE_KEYS.THEME) ?? themeConfig.colorMode;
    document.documentElement.setAttribute('data-theme', theme);
  }, [preferences?.theme]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App: FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public landing page */}
        <Route path="/" element={<LandingPage />} />

        {/* Protected channel routes - using channelId directly in URL */}
        <Route
          path="/:channelId"
          element={
            <ProtectedRoute>
              <div className="flex h-screen">
                <NavigationPanel />
                <main className="flex-1">
                  <ChannelView />
                  <Outlet />
                </main>
              </div>
            </ProtectedRoute>
          }
        >
          {/* Thread route as a child of channel */}
          <Route path="thread/:threadId" element={<ThreadView />} />
        </Route>

        {/* Catch all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App; 