import { useState } from 'react';
import { useMessageStore, useUserStore } from '../../stores';
import type { Message, User } from '../../types/store.types';
import { format } from 'date-fns';
import { ChatBubbleLeftIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { marked, MarkedOptions, Renderer } from 'marked';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-markdown';
import 'prismjs/themes/prism-tomorrow.css';
import MessageReactions from './MessageReactions';
import RichTextEditor from '../common/RichTextEditor';

// Configure marked options
const options: MarkedOptions = {
  gfm: true, // GitHub Flavored Markdown
  breaks: true, // Convert line breaks to <br>
};

// Configure syntax highlighting
const renderer = new marked.Renderer();
renderer.code = function({ text, lang }: { text: string, lang?: string }) {
  if (lang && Prism.languages[lang]) {
    try {
      const highlighted = Prism.highlight(text, Prism.languages[lang], lang);
      return `<pre><code class="language-${lang}">${highlighted}</code></pre>`;
    } catch (e) {
      console.error('Error highlighting code:', e);
    }
  }
  return `<pre><code>${text}</code></pre>`;
};

marked.setOptions({ ...options, renderer });

interface MessageItemProps {
  message: Message;
  user?: User;
  isThreadMessage?: boolean;
  isThreadParent?: boolean;
}

export default function MessageItem({ message, user, isThreadMessage, isThreadParent }: MessageItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const setActiveThread = useMessageStore((state) => state.setActiveThread);
  const updateMessage = useMessageStore((state) => state.updateMessage);
  const deleteMessage = useMessageStore((state) => state.deleteMessage);
  const currentUser = useUserStore((state) => state.currentUser);
  const threadMessages = useMessageStore((state) => state.threads[message.id] || []);

  const handleThreadClick = () => {
    if (!isThreadMessage) {
      setActiveThread(message.id);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditContent(message.content);
  };

  const handleEditSubmit = () => {
    if (editContent.trim() === message.content.trim()) {
      setIsEditing(false);
      return;
    }

    updateMessage(message.channelId, message.id, editContent.trim(), isThreadMessage);
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditContent(message.content);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    deleteMessage(message.channelId, message.id, isThreadMessage);
    setShowDeleteConfirm(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  const isCurrentUser = currentUser?.id === message.userId;

  return (
    <div 
      id={`message-${message.id}`}
      className="group relative flex items-start space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
      onClick={!isThreadMessage ? handleThreadClick : undefined}
    >
      {/* Avatar and User Info */}
      <div className="relative flex-shrink-0">
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
        {/* User Info */}
        <div className="flex items-center space-x-2">
          <span className="font-medium text-gray-900 dark:text-white">
            {user?.name || 'Unknown User'}
          </span>
          <span className="text-xs text-gray-500">
            {format(new Date(message.createdAt), 'h:mm a')}
          </span>
          {message.updatedAt !== message.createdAt && !message.deletedAt && (
            <span className="text-xs text-gray-400">(edited)</span>
          )}
          {isCurrentUser && !isEditing && !message.deletedAt && (
            <div className="invisible flex space-x-1 group-hover:visible">
              <button
                onClick={handleEditClick}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                onClick={handleDeleteClick}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-700"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Message Text */}
        <div className={!isThreadMessage && !isEditing ? 'cursor-pointer' : ''}>
          {isEditing ? (
            <div className="mt-2">
              <RichTextEditor
                value={editContent}
                onChange={setEditContent}
                onSubmit={handleEditSubmit}
              />
              <div className="mt-2 flex space-x-2">
                <button
                  onClick={handleEditSubmit}
                  className="rounded-md bg-blue-500 px-3 py-1 text-sm font-medium text-white hover:bg-blue-600"
                >
                  Save
                </button>
                <button
                  onClick={handleEditCancel}
                  className="rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div 
              className="prose prose-sm max-w-none dark:prose-invert [&_pre]:!bg-gray-800 [&_pre]:!p-4 [&_pre]:!rounded-lg [&_code]:!font-mono [&_code]:!text-sm [&_pre]:!whitespace-pre-wrap [&_pre]:!break-words [&_pre]:!overflow-x-auto [&_pre_code]:!whitespace-pre-wrap [&_pre_code]:!break-words [&_a]:!text-blue-500 [&_a]:!font-medium [&_a]:!hover:text-blue-700 [&_a]:!hover:underline dark:[&_a]:!text-blue-400 dark:[&_a]:!hover:text-blue-300 [&_a]:!after:content-['_↗'] [&_a]:!after:ml-0.5"
            >
              {message.deletedAt ? (
                <p className="italic text-gray-500 dark:text-gray-400">
                  This message has been deleted
                </p>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: marked.parse(message.content) }} />
              )}
            </div>
          )}
        </div>
        
        {/* Message Actions */}
        <div>
          <div className="flex items-center space-x-4">
            {!message.deletedAt && (
              <MessageReactions message={message} isThreadMessage={isThreadMessage} />
            )}
            
            {/* Thread Indicator */}
            {!isThreadMessage && threadMessages.length > 0 && (
              <button 
                onClick={handleThreadClick}
                className="mt-1 flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <ChatBubbleLeftIcon className="h-4 w-4" />
                <span>{threadMessages.length === 1 ? '1 reply' : `${threadMessages.length} replies`}</span>
              </button>
            )}
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="absolute left-0 top-0 z-10 flex h-full w-full items-center justify-center bg-gray-900/50">
            <div className="rounded-lg bg-white p-4 shadow-lg dark:bg-gray-800">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Are you sure you want to delete this message?
                {threadMessages.length > 0 && !isThreadMessage && (
                  <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                    The message will be marked as deleted but remain visible in the thread.
                  </span>
                )}
              </p>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={handleDeleteCancel}
                  className="rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="rounded-md bg-red-500 px-3 py-1 text-sm font-medium text-white hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 