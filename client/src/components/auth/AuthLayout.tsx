import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import PasswordReset from './PasswordReset';

type AuthView = 'login' | 'register' | 'reset';

interface AuthLayoutProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: AuthView;
}

export default function AuthLayout({ isOpen, onClose, initialView = 'login' }: AuthLayoutProps) {
  const [currentView, setCurrentView] = useState<AuthView>(initialView);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* The backdrop, rendered as a fixed sibling to the panel container */}
      <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm" aria-hidden="true" />

      {/* Full-screen container to center the panel */}
      <div className="fixed inset-0 flex items-center justify-center p-4 bg-white/0 dark:bg-gray-900/0">
        <Dialog.Panel className="mx-auto w-full max-w-sm rounded-xl bg-white dark:bg-gray-800 p-6 shadow-xl ring-1 ring-black/5 dark:ring-white/10">
          {currentView === 'login' && (
            <LoginForm
              onClose={onClose}
              onRegister={() => setCurrentView('register')}
            />
          )}
          
          {currentView === 'register' && (
            <RegisterForm
              onLogin={() => setCurrentView('login')}
            />
          )}
          
          {currentView === 'reset' && (
            <PasswordReset
              onLogin={() => setCurrentView('login')}
            />
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 