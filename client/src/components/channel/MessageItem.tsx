import { useState } from 'react';
import { useMessageStore, useUserStore } from '../../stores';
import type { Message } from '../../types/message.types';
import type { User } from '../../types/user.types';
import { format } from 'date-fns';
import { ChatBubbleLeftIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { updateMessage, deleteMessage } from '../../services/message';
import MessageReactions from './MessageReactions';
import FormattedText from '../common/FormattedText';

interface MessageItemProps {
  message: Message;
  isThreadMessage?: boolean;
  isThreadParent?: boolean;
}

// Helper function to format message content
function formatMessageContent(text: string): string {
  return text
    // Convert escaped newlines to real newlines
    .replace(/\\n/g, '\n')
    // Remove any triple newlines
    .replace(/\n{3,}/g, '\n\n')
    // Trim extra whitespace
    .trim();
}

export default function MessageItem({ message, isThreadMessage, isThreadParent }: MessageItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const { updateMessage: updateMessageInStore, deleteMessage: deleteMessageFromStore, setActiveThread } = useMessageStore();
  const currentUser = useUserStore((state) => state.currentUser);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = async () => {
    if (!editContent.trim()) {
      setError('Message cannot be empty');
      return;
    }

    try {
      const updatedMessage = await updateMessage(message.id, editContent);
      updateMessageInStore(message.channelId, message.id, updatedMessage.content, isThreadMessage || false);
      setIsEditing(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update message');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMessage(message.id);
      deleteMessageFromStore(message.channelId, message.id, isThreadMessage || false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete message');
    }
  };

  const handleThreadClick = () => {
    console.log('[MessageItem] Thread click attempted:', {
      messageId: message.id,
      channelId: message.channelId,
      isThreadMessage,
      isThreadParent,
      showThreadButton
    });
    
    if (!message.isThreadMessage) {
      console.log('[MessageItem] Thread click handler called for message:', message.id);
      setActiveThread(message.id, message.channelId);
      console.log('[MessageItem] Active thread set to:', message.id, 'in channel:', message.channelId);
    } else {
      console.log('[MessageItem] Thread click ignored - message is already a thread message');
    }
  };

  const canEdit = currentUser?.id === message.userId && !message.deletedAt;
  const canDelete = currentUser?.id === message.userId && !message.deletedAt;
  const showThreadButton = !message.isThreadMessage && !message.isThreadParent;
  const hasReplies = typeof message.replyCount === 'number' && message.replyCount > 0;
  const replyCount = message.replyCount || 0;

  console.log('[MessageItem] Message state:', {
    id: message.id,
    replyCount: message.replyCount,
    hasReplies,
    isThreadMessage,
    isThreadParent,
    showThreadButton
  });

  if (message.deletedAt) {
    return (
      <div className="px-4 py-2 text-gray-500 dark:text-gray-400 italic">
        This message was deleted
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 group">
      <div className="flex-shrink-0 w-10 h-10 overflow-hidden rounded-full">
        {message.user?.avatar_url ? (
          <img
            src={message.user.avatar_url}
            alt={message.user.username || 'User'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
            {(message.user?.username || 'U').charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium dark:text-white">
            {message.user?.username || 'Unknown User'}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {format(new Date(message.createdAt), 'MMM d, h:mm a')}
          </span>
          {message.edited && (
            <span className="text-xs text-gray-500 dark:text-gray-400">(edited)</span>
          )}
        </div>

        {isEditing ? (
          <div className="mt-1">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              rows={3}
            />
            <div className="mt-2 flex gap-2">
              <button
                onClick={handleEdit}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-1">
              {!isThreadMessage && !message.isThreadParent && hasReplies ? (
                <button
                  onClick={handleThreadClick}
                  className="w-full text-left"
                >
                  <FormattedText text={formatMessageContent(message.content)} />
                </button>
              ) : (
                <FormattedText text={formatMessageContent(message.content)} />
              )}
            </div>
            <div className="mt-2 flex items-center space-x-2">
              <MessageReactions message={message} />
              {!isThreadMessage && (
                <button
                  onClick={handleThreadClick}
                  className="flex items-center space-x-1 rounded px-2 py-1 text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ChatBubbleLeftIcon className="h-4 w-4" />
                  <span>
                    {hasReplies ? (
                      `${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`
                    ) : (
                      'Reply'
                    )}
                  </span>
                </button>
              )}
              {message.isThreadParent && (
                <button
                  onClick={handleThreadClick}
                  className="flex items-center space-x-1 rounded px-2 py-1 text-xs text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ChatBubbleLeftIcon className="h-4 w-4" />
                  <span>View Thread</span>
                </button>
              )}
              {canEdit && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="hidden rounded p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 group-hover:block"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
              )}
              {canDelete && (
                <button
                  onClick={handleDelete}
                  className="hidden rounded p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 group-hover:block"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
} 