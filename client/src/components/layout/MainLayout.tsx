import { ReactNode } from 'react';
import { useAuthStore } from '../../stores';
import Sidebar from '../navigation/Sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Welcome to ChatGenius</h1>
        <p className="mt-2">Please sign in to continue</p>
      </div>
    </div>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
} 