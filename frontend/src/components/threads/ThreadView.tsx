import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApiGet, useApiPost } from "@/services/api.service";
import { Message, MessageType } from '@/types/message.types';

interface ThreadMessage extends Message {
  threadId?: string;
}

interface Thread {
  id: string;
  parentMessage: ThreadMessage;
  replies: ThreadMessage[];
}

export const ThreadView: React.FC = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const [thread, setThread] = useState<Thread | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Setup authenticated API calls
  const { execute: loadThread, isLoading, error: threadError } = useApiGet<Thread>(`/threads/${threadId}`);
  const { execute: sendReply, isLoading: isSending } = useApiPost<ThreadMessage>(`/threads/${threadId}/replies`);

  // Load thread data
  useEffect(() => {
    if (threadId) {
      loadThread()
        .then(fetchedThread => {
          if (!fetchedThread) {
            setError('Thread not found');
            return;
          }
          setThread(fetchedThread);
          setError(null);
        })
        .catch(error => {
          console.error('Failed to load thread:', error);
          setError('Failed to load thread');
        });
    }
  }, [threadId, loadThread]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || isSending) return;

    try {
      const reply = await sendReply({ 
        content: replyContent.trim(),
        type: MessageType.TEXT
      });
      
      if (!reply) {
        console.error('No response from send reply API');
        return;
      }

      if (thread) {
        setThread({
          ...thread,
          replies: [...thread.replies, reply]
        });
        setReplyContent('');
      }
    } catch (error) {
      console.error('Failed to send reply:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-400">Loading thread...</div>
        </div>
      </div>
    );
  }

  if (error || threadError) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <div className="text-center text-red-500">
          <p>{error || threadError?.message || 'Failed to load thread'}</p>
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <div className="text-gray-400">Thread not found</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-900 border-l border-gray-800">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-white">Thread</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* Parent Message */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-1">
                <div className="flex items-baseline">
                  <span className="font-medium text-white">User {thread.parentMessage.userId}</span>
                  <span className="ml-2 text-sm text-gray-400">
                    {new Date(thread.parentMessage.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-300 mt-1">{thread.parentMessage.content}</p>
              </div>
            </div>
          </div>

          {/* Replies */}
          {thread.replies.length === 0 ? (
            <div className="text-center text-gray-500">No replies yet</div>
          ) : (
            thread.replies.map(reply => (
              <div key={reply.id} className="bg-gray-800/50 rounded-lg p-4 ml-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-1">
                    <div className="flex items-baseline">
                      <span className="font-medium text-white">User {reply.userId}</span>
                      <span className="ml-2 text-sm text-gray-400">
                        {new Date(reply.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-300 mt-1">{reply.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <form onSubmit={handleSendReply} className="p-4 border-t border-gray-800">
        <input
          type="text"
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          placeholder="Reply to thread..."
          className="w-full bg-gray-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSending}
        />
        {isSending && (
          <div className="mt-2 text-sm text-gray-400">Sending reply...</div>
        )}
      </form>
    </div>
  );
}; 