import { useState, useRef, useEffect } from 'react';
import { useMessageStore, useUserStore } from '../../stores';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import RichTextEditor from '../common/RichTextEditor';
import { isValidMarkdown, formatMessageContent } from '../../utils/markdown';

interface MessageInputProps {
  channelId: string;
  threadId?: string;
  placeholder?: string;
}

export default function MessageInput({ channelId, threadId, placeholder = "Type a message..." }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const typingTimerRef = useRef<number>();
  const { addMessage, addThreadMessage } = useMessageStore();
  const { currentUser, setTypingStatus } = useUserStore();

  const TYPING_TIMEOUT = 2000; // 2 seconds

  useEffect(() => {
    return () => {
      // Clear typing status and timer on unmount
      if (currentUser) {
        setTypingStatus(currentUser.id, channelId, threadId || null, false);
      }
      if (typingTimerRef.current) {
        window.clearTimeout(typingTimerRef.current);
      }
    };
  }, [currentUser, channelId, threadId, setTypingStatus]);

  const handleTyping = () => {
    if (!currentUser) return;

    // Set typing status to true
    setTypingStatus(currentUser.id, channelId, threadId || null, true);

    // Clear existing timer
    if (typingTimerRef.current) {
      window.clearTimeout(typingTimerRef.current);
    }

    // Set new timer to clear typing status
    typingTimerRef.current = window.setTimeout(() => {
      setTypingStatus(currentUser.id, channelId, threadId || null, false);
    }, TYPING_TIMEOUT);
  };

  const handleSubmit = () => {
    if (!message.trim() || !currentUser) return;

    // Clear typing status
    setTypingStatus(currentUser.id, channelId, threadId || null, false);
    if (typingTimerRef.current) {
      window.clearTimeout(typingTimerRef.current);
    }

    // Validate Markdown content
    if (!isValidMarkdown(message)) {
      setError('Invalid Markdown formatting. Please check your message.');
      return;
    }

    // Format the message content
    const formattedContent = formatMessageContent(message);

    const newMessage = {
      id: crypto.randomUUID(),
      content: formattedContent,
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
    setError(null);
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      {error && (
        <div className="mb-2 rounded-md bg-red-50 p-2 text-sm text-red-600 dark:bg-red-900/50 dark:text-red-200">
          {error}
        </div>
      )}
      <div className="flex items-end space-x-2">
        <div className="flex-1">
          <RichTextEditor
            value={message}
            onChange={(value) => {
              setMessage(value);
              handleTyping();
            }}
            onSubmit={handleSubmit}
            placeholder={placeholder}
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