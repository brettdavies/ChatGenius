import { useChannelStore, useUserStore } from '../../stores';
import ChannelList from '../channels/ChannelList';
import UserProfile from '../profile/UserProfile';

export default function Sidebar() {
  const channels = useChannelStore((state) => state.channels);
  const channelsLoading = useChannelStore((state) => state.loading);
  const currentUser = useUserStore((state) => state.currentUser);
  const userLoading = useUserStore((state) => state.loading);

  return (
    <aside className="flex w-64 flex-col bg-gray-800 text-white">
      {/* Workspace Header */}
      <div className="flex h-12 items-center px-4 font-semibold">
        <h1>ChatGenius</h1>
      </div>

      {/* Channels Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2">
          <h2 className="mb-2 text-sm font-semibold uppercase text-gray-400">Channels</h2>
          {channelsLoading ? (
            <div className="py-2 text-sm text-gray-400">Loading channels...</div>
          ) : (
            <ChannelList channels={channels} />
          )}
        </div>
      </div>

      {/* User Profile Section */}
      <div className="border-t border-gray-700 p-4">
        {userLoading ? (
          <div className="text-sm text-gray-400">Loading profile...</div>
        ) : (
          currentUser && <UserProfile user={currentUser} />
        )}
      </div>
    </aside>
  );
} 