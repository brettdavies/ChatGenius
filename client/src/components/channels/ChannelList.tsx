import { useChannelStore } from '../../stores';
import type { Channel } from '../../types/store.types';
import { HashtagIcon, LockClosedIcon } from '@heroicons/react/24/outline';

interface ChannelListProps {
  channels: Channel[];
}

export default function ChannelList({ channels }: ChannelListProps) {
  const activeChannelId = useChannelStore((state) => state.activeChannelId);
  const setActiveChannel = useChannelStore((state) => state.setActiveChannel);

  return (
    <ul className="space-y-1">
      {channels.map((channel) => (
        <li key={channel.id}>
          <button
            onClick={() => setActiveChannel(channel.id)}
            className={`flex w-full items-center rounded px-2 py-1 text-left text-sm hover:bg-gray-700 ${
              activeChannelId === channel.id ? 'bg-gray-700' : ''
            }`}
          >
            {channel.isPrivate ? (
              <LockClosedIcon className="mr-2 h-4 w-4 text-gray-400" />
            ) : (
              <HashtagIcon className="mr-2 h-4 w-4 text-gray-400" />
            )}
            <span className="truncate">{channel.name}</span>
          </button>
        </li>
      ))}
    </ul>
  );
} 