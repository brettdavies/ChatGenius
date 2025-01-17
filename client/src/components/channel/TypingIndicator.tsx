import { useUserStore } from '../../stores';

interface TypingIndicatorProps {
  channelId: string;
  threadId?: string;
}

export default function TypingIndicator({ channelId, threadId }: TypingIndicatorProps) {
  const currentUser = useUserStore((state) => state.currentUser);
  const users = useUserStore((state) => state.users);
  const typingUsers = useUserStore((state) => state.typingUsers);

  // Get typing users for this channel/thread
  const channelTypingUsers = typingUsers[channelId]?.channelTyping || new Set<string>();
  const threadTypingUsers = threadId ? (typingUsers[channelId]?.threadTyping[threadId] || new Set<string>()) : new Set<string>();
  const activeTypingUsers = threadId ? threadTypingUsers : channelTypingUsers;

  // Get user objects for all typing users
  const typingUserObjects = Array.from(activeTypingUsers)
    .map(id => users.find(u => u.id === id))
    .filter(Boolean);

  if (typingUserObjects.length === 0) return null;

  // If only current user is typing
  if (typingUserObjects.length === 1 && typingUserObjects[0]?.id === currentUser?.id) {
    return (
      <div className="flex items-center space-x-2 px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex space-x-1">
          <span className="animate-bounce">•</span>
          <span className="animate-bounce [animation-delay:0.2s]">•</span>
          <span className="animate-bounce [animation-delay:0.4s]">•</span>
        </div>
        <span>You are typing...</span>
      </div>
    );
  }

  // Filter out current user for other cases
  const otherTypingUsers = typingUserObjects.filter(u => u?.id !== currentUser?.id);

  return (
    <div className="flex items-center space-x-2 px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
      <div className="flex space-x-1">
        <span className="animate-bounce">•</span>
        <span className="animate-bounce [animation-delay:0.2s]">•</span>
        <span className="animate-bounce [animation-delay:0.4s]">•</span>
      </div>
      <span>
        {otherTypingUsers.length === 0 && (
          <>You are typing...</>
        )}
        {otherTypingUsers.length === 1 && (
          <>{otherTypingUsers[0]?.name} is typing...</>
        )}
        {otherTypingUsers.length === 2 && (
          <>{otherTypingUsers[0]?.name} and {otherTypingUsers[1]?.name} are typing...</>
        )}
        {otherTypingUsers.length > 2 && (
          <>Several people are typing...</>
        )}
      </span>
    </div>
  );
} 