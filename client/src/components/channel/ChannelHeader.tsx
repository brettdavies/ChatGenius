import { HashtagIcon, LockClosedIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import type { Channel } from '../../types/store.types';
import { useUserStore } from '../../stores';
import SearchInput from '../search/SearchInput';

interface ChannelHeaderProps {
  channel: Channel;
}

export default function ChannelHeader({ channel }: ChannelHeaderProps) {
  const onlineUsers = useUserStore((state) => state.onlineUsers);

  return (
    <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-700">
      <div className="flex items-center space-x-2">
        <div className="flex items-center">
          {channel.isPrivate ? (
            <LockClosedIcon className="h-4 w-4 text-gray-400" />
          ) : (
            <HashtagIcon className="h-4 w-4 text-gray-400" />
          )}
        </div>
        <div>
          <h2 className="text-lg font-medium">{channel.name}</h2>
          {channel.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {channel.description}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="w-64">
          <SearchInput />
        </div>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <UserGroupIcon className="mr-1 h-4 w-4" />
          <span>{onlineUsers.size} online</span>
        </div>
      </div>
    </div>
  );
} 