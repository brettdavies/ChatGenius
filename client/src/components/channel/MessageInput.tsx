import { useState } from 'react';
import { useMessageStore, useUserStore } from '../../stores';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import RichTextEditor from '../common/RichTextEditor';

interface MessageInputProps {
  channelId: string;
  threadId?: string;
  placeholder?: string;
}

export default function MessageInput({ channelId, threadId, placeholder = "Type a message..." }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const currentUser = useUserStore((state) => state.currentUser);
  const addMessage = useMessageStore((state) => state.addMessage);
  const addThreadMessage = useMessageStore((state) => state.addThreadMessage);

  const handleSubmit = () => {
    if (!message.trim() || !currentUser) return;

    const newMessage = {
      id: crypto.randomUUID(),
      content: message.trim(),
      userId: currentUser.id,
      channelId,
      threadId,
      parentId: threadId, // If this is a thread reply
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (threadId) {
      // Only add to thread if it's a thread reply
      addThreadMessage(threadId, newMessage);
    } else {
      // Only add to channel if it's a main message
      addMessage(channelId, newMessage);
    }
    
    setMessage('');
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-end space-x-2">
        <div className="flex-1">
          <RichTextEditor
            value={message}
            onChange={setMessage}
            placeholder={placeholder}
            onSubmit={handleSubmit}
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={!message.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
        >
          <PaperAirplaneIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
} 