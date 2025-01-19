import { useUserStore } from '../../stores';
import { ChannelList } from '../channel/ChannelList';
import UserProfile from '../profile/UserProfile';
import { PlusIcon, UserPlusIcon } from '@heroicons/react/24/outline';

export default function Sidebar() {
  const currentUser = useUserStore((state) => state.currentUser);
  const userLoading = useUserStore((state) => state.loading);

  return (
    <div className="flex h-full flex-col bg-gray-800 text-white border-r border-gray-700">
      {/* Workspace Header */}
      <div className="flex h-14 items-center px-4 font-semibold flex-shrink-0 border-b border-gray-700">
        <h1>ChatGenius</h1>
      </div>

      {/* Channels Section - Takes remaining space */}
      <div className="flex-1 overflow-y-auto min-h-0 py-4">
        <div className="px-4">
          <div className="mb-2">
            <h2 className="text-sm font-semibold uppercase text-gray-400 mb-1">Channels</h2>
            <div className="flex gap-2">
              <button
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded-md flex-1"
                disabled
              >
                <PlusIcon className="w-4 h-4" />
                Create
              </button>
              <button
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded-md flex-1"
                disabled
              >
                <UserPlusIcon className="w-4 h-4" />
                Join
              </button>
            </div>
          </div>
          <ChannelList />
        </div>
      </div>

      {/* User Profile Section - Fixed height to match message input */}
      <div className="flex-shrink-0 h-[73px] border-t border-gray-700">
        {userLoading ? (
          <div className="px-4 h-full flex items-center text-sm text-gray-400">Loading profile...</div>
        ) : (
          currentUser && <div className="px-4 h-full flex items-center"><UserProfile /></div>
        )}
      </div>
    </div>
  );
} 