import { useEffect, useRef } from 'react';
import { useMessageStore, useUserStore, useChannelStore } from '../../stores';
import { format } from 'date-fns';
import { HashtagIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function SearchResultsView() {
  const searchQuery = useMessageStore((state) => state.searchQuery);
  const searchResults = useMessageStore((state) => state.searchResults);
  const clearSearch = useMessageStore((state) => state.clearSearch);
  const setActiveChannel = useChannelStore((state) => state.setActiveChannel);
  const setActiveThread = useMessageStore((state) => state.setActiveThread);
  const users = useUserStore((state) => state.users);
  const channels = useChannelStore((state) => state.channels);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!searchQuery) {
    return null;
  }

  const handleClose = () => {
    clearSearch();
    // Return focus to search input
    const searchInput = document.getElementById('message-search');
    if (searchInput) {
      searchInput.focus();
    }
  };

  const handleResultClick = async (channelId: string, messageId: string) => {
    // First set the active channel and thread if needed
    setActiveChannel(channelId);
    
    // Close the search modal
    handleClose();

    // Wait for channel change to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Find and scroll to the message
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Add highlight class
      messageElement.classList.add('bg-yellow-100', 'dark:bg-yellow-900/30');
      
      // Remove highlight after animation
      setTimeout(() => {
        messageElement.classList.remove('bg-yellow-100', 'dark:bg-yellow-900/30');
      }, 2000);

      // If message has thread replies, open the thread view
      const message = searchResults.find(m => m.id === messageId);
      if (message?.replyCount) {
        setActiveThread(messageId);
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center bg-gray-900/50 pt-20"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div 
        ref={modalRef}
        className="w-full max-w-2xl rounded-lg bg-gray-800 shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
          <h2 className="text-lg font-medium text-white">
            {searchResults.length === 0
              ? 'No results found'
              : `${searchResults.length} result${searchResults.length === 1 ? '' : 's'}`}
          </h2>
          <button
            onClick={handleClose}
            className="rounded p-1 hover:bg-gray-700"
          >
            <XMarkIcon className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-2">
          {searchResults.map((message) => {
            const user = users.find((u) => u.id === message.userId);
            const channel = channels.find((c) => c.id === message.channelId);

            return (
              <button
                key={message.id}
                onClick={() => handleResultClick(message.channelId, message.id)}
                className="mb-2 block w-full rounded-md bg-gray-700 p-4 text-left hover:bg-gray-600"
              >
                {/* Channel Info */}
                <div className="mb-2 flex items-center text-sm text-gray-400">
                  <HashtagIcon className="mr-1 h-4 w-4" />
                  <span>{channel?.name || 'Unknown Channel'}</span>
                </div>

                {/* User and Timestamp */}
                <div className="mb-2 flex items-center space-x-2">
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
    </div>
  );
} 