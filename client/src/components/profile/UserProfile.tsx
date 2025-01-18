import { useState } from 'react';
import { Menu } from '@headlessui/react';
import { useUserStore, useAuthStore } from '../../stores';
import { ArrowRightOnRectangleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import SettingsModal from './SettingsModal';
import { logout } from '../../services/auth';

export default function UserProfile() {
  const currentUser = useUserStore((state) => state.currentUser);
  const resetUser = useUserStore((state) => state.reset);
  const logoutAuth = useAuthStore((state) => state.reset);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!currentUser) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      // Reset both stores first to ensure immediate UI update
      logoutAuth();
      resetUser();
      
      // Then call the auth service to logout
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
      setError(error instanceof Error ? error.message : 'Failed to sign out');
    }
  };

  return (
    <>
      <Menu as="div" className="relative w-full">
        <Menu.Button className="flex w-full items-center group">
          <div className="flex-shrink-0 mr-3">
            {currentUser.avatar_url ? (
              <img
                src={currentUser.avatar_url}
                alt={`${currentUser.username}'s avatar`}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-600">
                <span className="text-sm font-medium text-white">
                  {currentUser.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col text-left min-w-0">
            <span className="text-sm font-medium text-white truncate">
              {currentUser.username}
            </span>
            <span className="text-xs text-gray-400 truncate">
              {currentUser.email}
            </span>
          </div>
        </Menu.Button>

        <Menu.Items className="absolute right-0 bottom-full mb-1 w-48 rounded-lg bg-gray-700 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className={`${
                    active ? 'bg-gray-600' : ''
                  } flex items-center w-full px-4 py-2 text-sm text-gray-200`}
                >
                  <Cog6ToothIcon className="h-4 w-4 mr-2" />
                  Settings
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleSignOut}
                  className={`${
                    active ? 'bg-gray-600' : ''
                  } flex items-center w-full px-4 py-2 text-sm text-gray-200`}
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                  Sign out
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Menu>

      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg">
          {error}
        </div>
      )}

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
} 