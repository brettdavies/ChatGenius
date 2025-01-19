import { useState } from 'react';
import { useUserStore } from '../../stores';
import type { Message } from '../../types/message.types';
import { addReaction, removeReaction } from '../../services/message';

interface MessageReactionsProps {
  message: Message;
}

export default function MessageReactions({ message }: MessageReactionsProps) {
  const [showPicker, setShowPicker] = useState(false);
  const currentUser = useUserStore((state) => state.currentUser);
  const setError = useUserStore((state) => state.setError);

  const handleReactionClick = async (emoji: string) => {
    if (!currentUser) return;

    try {
      const hasReacted = message.reactions?.[emoji]?.includes(currentUser.id);
      if (hasReacted) {
        await removeReaction(message.id, emoji);
      } else {
        await addReaction(message.id, emoji);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update reaction');
    }
  };

  const commonEmojis = ['👍', '❤️', '😄', '🎉', '🤔', '👀'];

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-1">
        {message.reactions && Object.entries(message.reactions).map(([emoji, users]) => (
          <button
            key={emoji}
            onClick={() => handleReactionClick(emoji)}
            className={`flex items-center space-x-1 rounded-full border px-2 py-0.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 ${
              users.includes(currentUser?.id || '') 
                ? 'border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400'
                : 'border-gray-200 bg-white text-gray-500 dark:border-gray-600 dark:bg-gray-800'
            }`}
          >
            <span>{emoji}</span>
            <span>{users.length}</span>
          </button>
        ))}
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 text-xs text-gray-500 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          +
        </button>
      </div>

      {showPicker && (
        <div className="absolute left-0 top-8 z-10 rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-600 dark:bg-gray-800">
          <div className="flex gap-1">
            {commonEmojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  handleReactionClick(emoji);
                  setShowPicker(false);
                }}
                className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 