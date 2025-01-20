import { useEffect, useRef, useState, useCallback } from 'react';
import { useMessageStore, useChannelStore } from '../../stores';
import type { Message } from '../../types/message.types';
import MessageItem from './MessageItem';
import { getMessages } from '../../services/message';

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const loading = useMessageStore((state) => state.loading);
  const setMessages = useMessageStore((state) => state.setMessages);
  const setLoading = useMessageStore((state) => state.setLoading);
  const setError = useMessageStore((state) => state.setError);
  const activeChannelId = useChannelStore((state) => state.activeChannelId);
  const [lastMessageDate, setLastMessageDate] = useState<Date | undefined>();

  useEffect(() => {
    async function fetchMessages() {
      if (!activeChannelId) return;
      
      try {
        setLoading(true);
        console.log('[MessageList] Fetching messages for channel:', activeChannelId);
        const { messages } = await getMessages(activeChannelId, 50, lastMessageDate);
        console.log('[MessageList] Received messages:', messages.length);
        setMessages(activeChannelId, messages);
        if (messages.length > 0 && !lastMessageDate) {
          setLastMessageDate(new Date(messages[0].createdAt));
        }
      } catch (error) {
        console.error('[MessageList] Error fetching messages:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch messages');
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();
  }, [activeChannelId, setMessages, setLoading, setError]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleLoadMore = useCallback(async () => {
    if (!activeChannelId || loading) return;

    try {
      setLoading(true);
      const { messages: olderMessages } = await getMessages(activeChannelId, 50, lastMessageDate);
      if (olderMessages.length > 0) {
        setMessages(activeChannelId, [...olderMessages, ...messages]);
        setLastMessageDate(new Date(olderMessages[0].createdAt));
      }
    } catch (error) {
      console.error('[MessageList] Error loading more messages:', error);
      setError(error instanceof Error ? error.message : 'Failed to load more messages');
    } finally {
      setLoading(false);
    }
  }, [activeChannelId, loading, lastMessageDate, messages, setMessages, setLoading, setError]);

  if (loading && messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading messages...</p>
      </div>
    );
  }

  if (!messages.length) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">No messages yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages container - takes full width and scrolls */}
      <div className="flex-1 w-full overflow-y-auto bg-white dark:bg-gray-900">
        <div className="space-y-1">
          {loading && <div className="flex items-center justify-center p-4 text-gray-500 dark:text-gray-400">Loading messages...</div>}
          {!loading && messages.length === 0 && (
            <div className="flex items-center justify-center p-4 text-gray-500 dark:text-gray-400">No messages yet</div>
          )}
          {messages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))}
        </div>
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
} 