import { useEffect, useRef } from 'react';
import { useMessageStore } from '../../stores';
import MessageItem from './MessageItem';
import ThreadMessageInput from './ThreadMessageInput';
import TypingIndicator from './TypingIndicator';
import { getThreadMessages } from '../../services/message';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function MessageThread() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeThreadId = useMessageStore((state) => state.activeThreadId);
  const activeChannelId = useMessageStore((state) => state.activeChannelId);
  const messages = useMessageStore((state) => state.threads[activeThreadId || ''] || []);
  const parentMessage = useMessageStore((state) => 
    activeChannelId && activeThreadId
      ? state.messages[activeChannelId]?.find(m => m.id === activeThreadId)
      : null
  );
  const setThreadMessages = useMessageStore((state) => state.setThreadMessages);
  const setLoading = useMessageStore((state) => state.setLoading);
  const setError = useMessageStore((state) => state.setError);
  const setActiveThread = useMessageStore((state) => state.setActiveThread);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    console.log('[MessageThread] Component mounted/updated with threadId:', activeThreadId);
    
    async function fetchThreadMessages() {
      if (!activeThreadId) {
        console.log('[MessageThread] No active thread ID, skipping fetch');
        return;
      }
      
      try {
        console.log('[MessageThread] Fetching messages for thread:', activeThreadId);
        setLoading(true);
        const { messages } = await getThreadMessages(activeThreadId);
        console.log('[MessageThread] Received thread messages:', messages.length);
        setThreadMessages(activeThreadId, messages);
      } catch (error) {
        console.error('[MessageThread] Error fetching thread messages:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch thread messages');
      } finally {
        setLoading(false);
      }
    }

    fetchThreadMessages();
  }, [activeThreadId, setThreadMessages, setLoading, setError]);

  if (!activeThreadId || !parentMessage) {
    console.log('[MessageThread] Not rendering - activeThreadId:', activeThreadId, 'parentMessage:', !!parentMessage);
    return null;
  }

  console.log('[MessageThread] Rendering thread with messages:', messages.length);

  const handleClose = () => {
    setActiveThread(null, null);
  };

  return (
    <div className="flex h-full flex-col bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
        <h2 className="text-lg font-semibold">Thread</h2>
        <button
          onClick={handleClose}
          className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {parentMessage && (
            <div className="mb-4 border-b border-gray-200 pb-4 dark:border-gray-700">
              <MessageItem 
                message={parentMessage}
                isThreadParent 
              />
            </div>
          )}
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageItem 
                key={message.id} 
                message={message}
                isThreadMessage 
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700">
        {activeChannelId && <TypingIndicator channelId={activeChannelId} />}
        <ThreadMessageInput />
      </div>
    </div>
  );
} 