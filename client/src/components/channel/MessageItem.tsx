import { useState } from 'react';
import { useMessageStore, useUserStore } from '../../stores';
import type { Message } from '../../types/message.types';
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
  const [editedContent, setEditedContent] = useState(message.content);
  const { updateMessage: updateMessageInStore, deleteMessage: deleteMessageFromStore, setActiveThread } = useMessageStore();
  const currentUser = useUserStore((state) => state.currentUser);
  const setError = useState<string | null>(null)[1];

  const handleEdit = async () => {
    if (!editedContent.trim()) {
      setError('Message cannot be empty');
      return;
    }

    try {
      const updatedMessage = await updateMessage(message.id, editedContent);
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
    <div className="group w-full hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <div className="flex items-start gap-3 px-4 py-2">
        <div className="flex-shrink-0">
          {message.user.avatar_url ? (
            <img
              src={message.user.avatar_url}
              alt={`${message.user.username}'s avatar`}
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-600">
              <span className="text-sm font-medium text-white">
                {message.user.username.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-medium text-gray-900 dark:text-white">
              {message.user.username}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {format(new Date(message.createdAt), 'MMM d, h:mm a')}
            </span>
          </div>
          <div className="mt-0.5 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words">
            {message.content}
          </div>
        </div>
      </div>
    </div>
  );
} 