import { useEffect, useRef } from 'react';
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

  useEffect(() => {
    async function fetchMessages() {
      if (!activeChannelId) return;
      
      try {
        setLoading(true);
        console.log('[MessageList] Fetching messages for channel:', activeChannelId);
        const { messages } = await getMessages(activeChannelId);
        console.log('[MessageList] Received messages:', messages.length);
        setMessages(activeChannelId, messages);
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

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-gray-500">Loading messages...</p>
      </div>
    );
  }

  if (!messages.length) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-gray-500">No messages yet</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 overflow-y-auto p-4">
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
} 