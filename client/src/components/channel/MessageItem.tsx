import { useMessageStore } from '../../stores';
import type { Message, User } from '../../types/store.types';
import { format } from 'date-fns';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import MessageReactions from './MessageReactions';

interface MessageItemProps {
  message: Message;
  user?: User;
  isThreadMessage?: boolean;
}

export default function MessageItem({ message, user, isThreadMessage }: MessageItemProps) {
  const setActiveThread = useMessageStore((state) => state.setActiveThread);
  const threadMessages = useMessageStore((state) => state.threads[message.id] || []);

  const handleThreadClick = () => {
    if (!isThreadMessage) {
      setActiveThread(message.id);
    }
  };

  return (
    <div className="group relative flex items-start space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50">
      {/* Avatar and User Info - No thread interaction */}
      <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="h-10 w-10 rounded-full"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-600">
            <span className="text-sm font-medium text-white">
              {user?.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <span
          className={`absolute -bottom-0.5 -right-1 block h-3 w-3 rounded-full ring-2 ring-white dark:ring-gray-900 ${
            user?.status === 'online'
              ? 'bg-green-400'
              : user?.status === 'away'
              ? 'bg-yellow-400'
              : 'bg-gray-400'
          }`}
        />
      </div>

      {/* Message Content Area */}
      <div className="min-w-0 flex-1">
        {/* User Info - No thread interaction */}
        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
          <span className="font-medium text-gray-900 dark:text-white">
            {user?.name || 'Unknown User'}
          </span>
          <span className="text-xs text-gray-500">
            {format(new Date(message.createdAt), 'h:mm a')}
          </span>
        </div>

        {/* Message Text - Clickable for thread */}
        <div 
          onClick={handleThreadClick}
          className={!isThreadMessage ? 'cursor-pointer' : ''}
        >
          <div 
            className="prose prose-sm dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: message.content }}
          />
        </div>
        
        {/* Message Actions - No thread interaction */}
        <div onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center space-x-4">
            <MessageReactions message={message} isThreadMessage={isThreadMessage} />
            
            {/* Thread Indicator */}
            {!isThreadMessage && threadMessages.length > 1 && (
              <div className="mt-1 flex items-center space-x-1 text-xs text-gray-500">
                <ChatBubbleLeftIcon className="h-4 w-4" />
                <span>
                  {threadMessages.length - 1} {threadMessages.length === 2 ? 'reply' : 'replies'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 