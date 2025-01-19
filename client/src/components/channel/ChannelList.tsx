import { useEffect } from 'react';
import { useChannelStore } from '../../stores/channel.store';
import { LockClosedIcon, HashtagIcon } from '@heroicons/react/24/outline';

export function ChannelList() {
  const { channels = [], activeChannelId, loading, error, fetchUserChannels, setActiveChannel } = useChannelStore();

  useEffect(() => {
    fetchUserChannels();
  }, [fetchUserChannels]);

  if (loading) {
    return <div className="text-sm text-gray-400 px-2">Loading channels...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-400 px-2">{error}</div>;
  }

  if (!channels?.length) {
    return (
      <div className="text-sm text-gray-400 px-2">
        No channels yet. Create one to get started!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {channels.map((channel) => (
        <button
          key={channel.id}
          onClick={() => setActiveChannel(channel.id)}
          className={`flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-700 ${
            channel.id === activeChannelId ? 'bg-gray-700' : ''
          }`}
        >
          {channel.type === 'private' ? (
            <LockClosedIcon className="w-4 h-4" />
          ) : (
            <HashtagIcon className="w-4 h-4" />
          )}
          <span className="truncate">{channel.name}</span>
        </button>
      ))}
    </div>
  );
} 