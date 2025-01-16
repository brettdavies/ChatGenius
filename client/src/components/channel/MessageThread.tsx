import { useEffect } from 'react';
import { useMessageStore, useUserStore } from '../../stores';
import MessageItem from './MessageItem';
import MessageInput from './MessageInput';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface MessageThreadProps {
  parentMessage: Message;
  onClose: () => void;
}

export default function MessageThread({ parentMessage, onClose }: MessageThreadProps) {
  const threadMessages = useMessageStore((state) => state.threads[parentMessage.id] || []);
  const users = useUserStore((state) => state.users);
  const addThreadMessage = useMessageStore((state) => state.addThreadMessage);
  const setThreadMessages = useMessageStore((state) => state.setThreadMessages);

  useEffect(() => {
    // Initialize thread with parent message if empty
    if (!threadMessages.length) {
      setThreadMessages(parentMessage.id, [parentMessage]);
    }
  }, [parentMessage, threadMessages.length, setThreadMessages]);

  return (
    <div className="flex h-full flex-col border-l border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      {/* Thread Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
        <h3 className="text-lg font-medium">Thread</h3>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Thread Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {threadMessages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            user={users.find((u) => u.id === message.userId)}
            isThreadMessage
          />
        ))}
      </div>

      {/* Thread Input */}
      <div className="border-t border-gray-200 p-4 dark:border-gray-700">
        <MessageInput
          channelId={parentMessage.channelId}
          threadId={parentMessage.id}
          placeholder="Reply in thread..."
        />
      </div>
    </div>
  );
} 