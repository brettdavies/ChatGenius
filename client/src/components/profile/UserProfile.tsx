import { useState } from 'react';
import { Menu } from '@headlessui/react';
import { useUserStore } from '../../stores';
import { ArrowRightOnRectangleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import SettingsModal from './SettingsModal';

export default function UserProfile() {
  const currentUser = useUserStore((state) => state.currentUser);
  const signOut = useUserStore((state) => state.signOut);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  if (!currentUser) {
    return null;
  }

  return (
    <>
      <div className="w-full bg-white dark:bg-gray-800 p-3">
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-start w-full cursor-pointer group">
            <div className="flex-shrink-0 mr-3">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-600">
                  <span className="text-sm font-medium text-white">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0 text-left">
              <span className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-gray-600 dark:group-hover:text-gray-300">
                {currentUser.name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {currentUser.email}
              </span>
            </div>
          </Menu.Button>

          <Menu.Items className="absolute bottom-full left-0 mb-1 w-48 origin-bottom-left rounded-md bg-white dark:bg-gray-700 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className={`${
                      active ? 'bg-gray-100 dark:bg-gray-600' : ''
                    } flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                  >
                    <Cog6ToothIcon className="h-4 w-4 mr-2" />
                    Settings
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={signOut}
                    className={`${
                      active ? 'bg-gray-100 dark:bg-gray-600' : ''
                    } flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                    Sign out
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Menu>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
} 