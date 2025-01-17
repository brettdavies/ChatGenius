import { useMessageStore, useUserStore, useChannelStore } from '../../stores';
import { format } from 'date-fns';
import { HashtagIcon } from '@heroicons/react/24/outline';

export default function SearchResults() {
  const searchQuery = useMessageStore((state) => state.searchQuery);
  const searchResults = useMessageStore((state) => state.searchResults);
  const setActiveChannel = useChannelStore((state) => state.setActiveChannel);
  const setActiveThread = useMessageStore((state) => state.setActiveThread);
  const users = useUserStore((state) => state.users);
  const channels = useChannelStore((state) => state.channels);

  if (!searchQuery) {
    return null;
  }

  const handleResultClick = (channelId: string, messageId: string) => {
    setActiveChannel(channelId);
    setActiveThread(messageId);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-700 px-4 py-2">
        <h2 className="text-sm font-medium text-gray-200">
          {searchResults.length === 0
            ? 'No results found'
            : `${searchResults.length} result${searchResults.length === 1 ? '' : 's'}`}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {searchResults.map((message) => {
          const user = users.find((u) => u.id === message.userId);
          const channel = channels.find((c) => c.id === message.channelId);

          return (
            <button
              key={message.id}
              onClick={() => handleResultClick(message.channelId, message.id)}
              className="block w-full border-b border-gray-700 px-4 py-3 text-left hover:bg-gray-700"
            >
              {/* Channel Info */}
              <div className="mb-1 flex items-center text-sm text-gray-400">
                <HashtagIcon className="mr-1 h-4 w-4" />
                <span>{channel?.name || 'Unknown Channel'}</span>
              </div>

              {/* User and Timestamp */}
              <div className="mb-1 flex items-center space-x-2">
                <span className="font-medium text-white">
                  {user?.name || 'Unknown User'}
                </span>
                <span className="text-xs text-gray-400">
                  {format(new Date(message.createdAt), 'MMM d, h:mm a')}
                </span>
              </div>

              {/* Message Preview */}
              <div className="text-sm text-gray-300">
                {message.content.length > 200
                  ? `${message.content.slice(0, 200)}...`
                  : message.content}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
} 