import { useEffect, useRef, useMemo } from 'react';
import { useMessageStore, useUserStore } from '../../stores';
import type { Message } from '../../types/store.types';
import MessageItem from './MessageItem';

interface MessageListProps {
  channelId: string;
}

export default function MessageList({ channelId }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const messageSelector = useMemo(
    () => (state: any) => state.messages[channelId] || [],
    [channelId]
  );
  
  const messages = useMessageStore(messageSelector);
  const loading = useMessageStore((state) => state.loading);
  const users = useUserStore((state) => state.users);

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
          user={users.find((u) => u.id === message.userId)}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
} 