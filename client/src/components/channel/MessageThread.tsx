import { useMessageStore, useUserStore } from '../../stores';
import MessageItem from './MessageItem';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';

interface MessageThreadProps {
  channelId: string;
  threadId: string;
}

export default function MessageThread({ channelId, threadId }: MessageThreadProps) {
  const messages = useMessageStore((state) => state.threads[threadId] || []);
  const parentMessage = useMessageStore((state) => 
    state.messages[channelId]?.find(m => m.id === threadId)
  );
  const users = useUserStore((state) => state.users);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 p-4 dark:border-gray-700">
        <h2 className="text-lg font-semibold">Thread</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {parentMessage && (
          <div className="mb-4 border-b border-gray-200 pb-4 dark:border-gray-700">
            <MessageItem 
              message={parentMessage} 
              user={users.find(u => u.id === parentMessage.userId)}
              isThreadParent 
            />
          </div>
        )}
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageItem 
              key={message.id} 
              message={message} 
              user={users.find(u => u.id === message.userId)}
              isThreadMessage 
            />
          ))}
        </div>
      </div>
      <TypingIndicator channelId={channelId} threadId={threadId} />
      <MessageInput channelId={channelId} threadId={threadId} />
    </div>
  );
} 