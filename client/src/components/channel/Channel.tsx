import { useEffect } from 'react';
import { useChannelStore, useMessageStore, useUserStore } from '../../stores';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ChannelHeader from './ChannelHeader';
import MessageThread from './MessageThread';
import SearchResultsView from '../search/SearchResultsView';
import { sampleMessages, sampleUsers } from '../../data/sample-messages';
import TypingIndicator from './TypingIndicator';

export default function Channel() {
  const activeChannelId = useChannelStore((state) => state.activeChannelId);
  const channels = useChannelStore((state) => state.channels);
  const setMessages = useMessageStore((state) => state.setMessages);
  const setUsers = useUserStore((state) => state.setUsers);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);
  const activeThreadId = useMessageStore((state) => state.activeThreadId);
  const messages = useMessageStore((state) => 
    activeChannelId ? state.messages[activeChannelId] || [] : []
  );
  const searchQuery = useMessageStore((state) => state.searchQuery);

  useEffect(() => {
    // Initialize sample data
    setUsers(sampleUsers);
    setCurrentUser(sampleUsers[0]); // Set Sarah as the current user
    
    if (activeChannelId) {
      const channelMessages = sampleMessages.filter(msg => msg.channelId === activeChannelId);
      setMessages(activeChannelId, channelMessages);
    }
  }, [activeChannelId, setMessages, setUsers, setCurrentUser]);

  if (!activeChannelId || !channels.find(c => c.id === activeChannelId)) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-gray-500">Select a channel to start chatting</p>
      </div>
    );
  }

  const activeChannel = channels.find(c => c.id === activeChannelId)!;

  return (
    <div className="flex h-full">
      <div className="flex flex-1 flex-col">
        <ChannelHeader channel={activeChannel} />
        <div className="flex-1 overflow-y-auto">
          <MessageList channelId={activeChannelId} />
        </div>
        <TypingIndicator channelId={activeChannelId} />
        <MessageInput channelId={activeChannelId} />
      </div>
      
      {activeThreadId && (
        <div className="w-96 border-l border-gray-200 dark:border-gray-700">
          <MessageThread 
            channelId={activeChannelId}
            threadId={activeThreadId}
          />
        </div>
      )}

      {/* Search Results Modal */}
      {searchQuery && <SearchResultsView />}
    </div>
  );
} 