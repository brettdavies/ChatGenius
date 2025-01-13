import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavStore } from '@/stores/nav.store';
import { useChannelStore } from '@/stores/channel.store';
import { useMessageStore } from '@/stores/message.store';
import { authenticatedApi } from '@/lib/api/authenticatedClient';
import { Channel } from '@/types/channel.types';
import { ApiChannel, ApiMessage } from '@/types/api/channel.types';

export const ChannelView: React.FC = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const { activeChannel, setActiveChannel } = useNavStore();
  const { channels, setChannels } = useChannelStore();
  const { messages, setMessages } = useMessageStore();
  const [messageContent, setMessageContent] = useState('');

  // Setup authenticated API calls
  const { execute: loadChannel, isLoading: isLoadingChannel } = authenticatedApi.useGet<ApiChannel>(
    `/channels/${channelId}`,
    undefined,
    {
      onError: (err) => console.error('Failed to load channel:', err)
    }
  );

  const { execute: loadMessages, isLoading: isLoadingMessages } = authenticatedApi.useGet<ApiMessage[]>(
    `/channels/${activeChannel}/messages`,
    undefined,
    {
      onError: (err) => console.error('Failed to load messages:', err)
    }
  );

  const { execute: sendMessage, isLoading: isSending } = authenticatedApi.usePost<ApiMessage, { content: string }>(
    `/channels/${activeChannel}/messages`,
    { content: messageContent.trim() },
    {
      onError: (err) => console.error('Failed to send message:', err)
    }
  );

  // Load channel data
  useEffect(() => {
    if (channelId) {
      loadChannel().then(channel => {
        if (channel) {
          setActiveChannel(channel.id);
          // Only add the channel if it's not already in the list
          if (!channels.some(c => c.id === channel.id)) {
            const normalizedChannel: Channel = {
              id: channel.id,
              shortId: channelId,
              name: channel.name,
              type: channel.type,
              description: channel.description,
              createdAt: channel.created_at,
              updatedAt: channel.updated_at,
              members: channel.members
            };
            setChannels([...channels, normalizedChannel]);
          }
        }
      });
    }
  }, [channelId, loadChannel, setActiveChannel, channels, setChannels]);

  // Load messages when channel changes
  useEffect(() => {
    if (activeChannel) {
      loadMessages().then(apiMessages => {
        if (apiMessages) {
          // Normalize API messages to match store format
          const normalizedMessages = apiMessages.map(msg => ({
            ...msg,
            createdAt: new Date(msg.createdAt),
            updatedAt: msg.updatedAt ? new Date(msg.updatedAt) : undefined,
            channelId: activeChannel
          }));
          setMessages(activeChannel, normalizedMessages);
        }
      });
    }
  }, [activeChannel, loadMessages, setMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim() || isSending || !activeChannel) return;

    try {
      const newMessage = await sendMessage();
      if (newMessage) {
        const normalizedMessage = {
          ...newMessage,
          createdAt: new Date(newMessage.createdAt),
          updatedAt: newMessage.updatedAt ? new Date(newMessage.updatedAt) : undefined,
          channelId: activeChannel
        };
        setMessages(activeChannel, [...(messages[activeChannel] || []), normalizedMessage]);
        setMessageContent('');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const currentChannel = channels.find(c => c.id === activeChannel);
  const currentMessages = activeChannel ? (messages[activeChannel] || []) : [];

  if (isLoadingChannel) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-400">Loading channel...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full w-full">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-white">
          {currentChannel ? `#${currentChannel.name}` : 'Loading...'}
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          {isLoadingMessages ? (
            <div className="text-center text-gray-400">Loading messages...</div>
          ) : (
            currentMessages.map((message) => (
              <div key={message.id} className="mb-4">
                <div className="flex items-start">
                  <div className="flex-1">
                    <div className="flex items-baseline">
                      <span className="font-medium text-white">User {message.userId}</span>
                      <span className="ml-2 text-sm text-gray-400">
                        {message.createdAt.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-gray-300 mt-1">{message.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
          <input
            type="text"
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            placeholder="Type a message..."
            className="w-full bg-gray-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSending}
          />
        </div>
      </form>
    </div>
  );
}; 