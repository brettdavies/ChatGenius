import { useEffect, useState, useCallback } from 'react';
import { useAuthStore, useUserStore } from '../../stores';
import Sidebar from '../navigation/Sidebar';
import LoginForm from '../auth/LoginForm';
import RegisterForm from '../auth/RegisterForm';
import { getCurrentUser } from '../../services/auth';

type AuthView = 'login' | 'register';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loading = useAuthStore((state) => state.loading);
  const setUser = useAuthStore((state) => state.setUser);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setError = useAuthStore((state) => state.setError);
  const [sidebarWidth, setSidebarWidth] = useState(window.innerWidth * 0.15); // 15% default
  const [isResizing, setIsResizing] = useState(false);
  const [authView, setAuthView] = useState<AuthView>('login');

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    const minWidth = window.innerWidth * 0.1; // 10%
    const maxWidth = window.innerWidth * 0.2; // 20%
    const newWidth = Math.min(Math.max(e.clientX, minWidth), maxWidth);
    
    setSidebarWidth(newWidth);
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    async function checkAuth() {
      try {
        setLoading(true);
        const user = await getCurrentUser();
        setUser(user);
        if (user) {
          setCurrentUser(user);
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to get current user');
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [setUser, setCurrentUser, setLoading, setError]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        {authView === 'login' ? (
          <LoginForm onRegister={() => setAuthView('register')} />
        ) : (
          <RegisterForm onLogin={() => setAuthView('login')} />
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <div 
        className="flex-shrink-0 overflow-hidden relative"
        style={{ width: `${sidebarWidth}px` }}
      >
        <Sidebar />
        <div
          className={`absolute top-0 right-0 w-4 h-full cursor-col-resize group -ml-2 ${
            isResizing ? 'bg-blue-500/20 z-10' : ''
          }`}
          onMouseDown={handleMouseDown}
        >
          {/* Resize handle line */}
          <div className={`absolute right-0 top-0 w-0.5 h-full bg-gray-300 dark:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity ${
            isResizing ? '!opacity-100 !bg-blue-500' : ''
          }`} />
        </div>
      </div>
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
      {/* Full screen overlay when resizing */}
      {isResizing && (
        <div className="fixed inset-0 z-50 cursor-col-resize" />
      )}
    </div>
  );
} 