import { useState } from 'react';
import { useMessageStore, useUserStore } from '../../stores';
import { FaceSmileIcon } from '@heroicons/react/24/outline';

// Common emoji reactions
const COMMON_REACTIONS = ['👍', '❤️', '😂', '🎉', '🚀', '👀', '💯'];

interface MessageReactionsProps {
  message: Message;
  isThreadMessage?: boolean;
}

export default function MessageReactions({ message, isThreadMessage }: MessageReactionsProps) {
  const [showPicker, setShowPicker] = useState(false);
  const currentUser = useUserStore((state) => state.currentUser);
  const addReaction = useMessageStore((state) => state.addReaction);
  const removeReaction = useMessageStore((state) => state.removeReaction);

  const handleReaction = (emoji: string) => {
    if (!currentUser) return;
    
    const hasReacted = message.reactions?.[emoji]?.includes(currentUser.id);
    if (hasReacted) {
      removeReaction(message.channelId, message.id, emoji, currentUser.id, isThreadMessage);
    } else {
      addReaction(message.channelId, message.id, emoji, currentUser.id, isThreadMessage);
    }
    setShowPicker(false);
  };

  return (
    <div className="relative mt-1">
      {/* Existing Reactions */}
      <div className="flex flex-wrap gap-1">
        {message.reactions && Object.entries(message.reactions).map(([emoji, users]) => (
          <button
            key={emoji}
            onClick={() => handleReaction(emoji)}
            className={`inline-flex items-center space-x-1 rounded-full px-2 py-0.5 text-xs hover:bg-gray-200 dark:hover:bg-gray-600 ${
              currentUser && users.includes(currentUser.id)
                ? 'bg-blue-100 dark:bg-blue-900/50'
                : 'bg-gray-100 dark:bg-gray-700'
            }`}
          >
            <span>{emoji}</span>
            <span className="text-gray-500 dark:text-gray-400">{users.length}</span>
          </button>
        ))}

        {/* Add Reaction Button */}
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="inline-flex h-5 w-5 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
        >
          <FaceSmileIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Emoji Picker */}
      {showPicker && (
        <div className="absolute bottom-full left-0 mb-1 flex space-x-1 rounded-lg bg-white p-2 shadow-lg dark:bg-gray-800">
          {COMMON_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 