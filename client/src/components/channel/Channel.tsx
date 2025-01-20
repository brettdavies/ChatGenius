import { useEffect, useState, useCallback } from 'react';
import { useChannelStore, useMessageStore } from '../../stores';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ChannelHeader from './ChannelHeader';
import MessageThread from './MessageThread';
import SearchResultsView from '../search/SearchResultsView';
import TypingIndicator from './TypingIndicator';

export default function Channel() {
  const activeChannelId = useChannelStore((state) => state.activeChannelId);
  const channels = useChannelStore((state) => state.channels);
  const activeThreadId = useMessageStore((state) => state.activeThreadId);
  const messages = useMessageStore((state) => activeChannelId ? state.messages[activeChannelId] || [] : []);
  const searchQuery = useMessageStore((state) => state.searchQuery);
  const [threadWidth, setThreadWidth] = useState(384); // Default 384px (w-96)
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    const mainPanelRect = document.getElementById('main-message-panel')?.getBoundingClientRect();
    if (!mainPanelRect) return;

    const totalWidth = mainPanelRect.width + threadWidth;
    const minWidth = Math.max(totalWidth * 0.1, 250); // At least 10% or 250px
    const maxWidth = totalWidth * 0.75; // Up to 75% of available space
    const newWidth = totalWidth - (e.clientX - mainPanelRect.left);
    
    setThreadWidth(Math.min(Math.max(newWidth, minWidth), maxWidth));
  }, [isResizing, threadWidth]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  if (!activeChannelId || !Array.isArray(channels) || !channels.find(c => c.id === activeChannelId)) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-gray-500">Select a channel to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <ChannelHeader />
      <div className="flex flex-1 min-h-0">
        <div id="main-message-panel" className="flex flex-1 flex-col min-h-0">
          <div className="flex-1 overflow-y-auto">
            <MessageList messages={messages} />
          </div>
          <div className="flex-shrink-0">
            <TypingIndicator channelId={activeChannelId} />
            <MessageInput />
          </div>
        </div>
        {activeThreadId && (
          <div 
            className="flex-shrink-0 overflow-hidden relative"
            style={{ width: `${threadWidth}px` }}
          >
            <div
              className={`absolute top-0 left-0 w-4 h-full cursor-col-resize group -ml-2 ${
                isResizing ? 'bg-blue-500/20 z-10' : ''
              }`}
              onMouseDown={handleMouseDown}
            >
              {/* Resize handle line */}
              <div className={`absolute left-2 top-0 w-0.5 h-full bg-gray-300 dark:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity ${
                isResizing ? '!opacity-100 !bg-blue-500' : ''
              }`} />
            </div>
            <div className="h-full border-l border-gray-200 dark:border-gray-700">
              <MessageThread />
            </div>
          </div>
        )}
        {searchQuery && (
          <div className="w-96 border-l border-gray-200 dark:border-gray-700 flex-shrink-0 overflow-hidden">
            <SearchResultsView />
          </div>
        )}
      </div>
      {/* Full screen overlay when resizing */}
      {isResizing && (
        <div className="fixed inset-0 z-50 cursor-col-resize" />
      )}
    </div>
  );
} 