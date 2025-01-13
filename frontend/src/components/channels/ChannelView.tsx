import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useChannelStore } from "@/stores/channel.store";
import { useMessageStore } from "@/stores/message.store";
import { useApiGet, useApiPost } from "@/services/api.service";
import { Channel, ChannelType } from "@/types/channel.types";
import { Message, MessageType } from "@/types/message.types";

interface ApiChannel {
  id: string;
  shortId: string;
  name: string;
  type: ChannelType;
  description?: string;
  created_at: string;
  updated_at: string;
  members: {
    id: string;
    user_id: string;
    channel_id: string;
    role: 'owner' | 'admin' | 'member';
    joined_at: string;
  }[];
}

interface ApiMessage {
  id: string;
  content: string;
  user_id: string;
  channel_id: string;
  type: MessageType;
  created_at: string;
  updated_at?: string;
}

export const ChannelView = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const { setActiveChannel, activeChannel } = useChannelStore();
  const { messages, sendMessage, setMessages } = useMessageStore();
  const [messageContent, setMessageContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Setup authenticated API calls
  const { execute: loadChannel, isLoading: isLoadingChannel, error: channelError } = useApiGet<ApiChannel>(`/channels/${channelId}`);
  const { execute: loadMessages, isLoading: isLoadingMessages, error: messagesError } = useApiGet<ApiMessage[]>(`/channels/${channelId}/messages`);
  const { execute: sendMessageApi, isLoading: isSending } = useApiPost<ApiMessage>(`/channels/${channelId}/messages`);

  // Load channel data
  useEffect(() => {
    if (channelId) {
      loadChannel()
        .then(apiChannel => {
          if (!apiChannel) {
            setError('Channel not found');
            return;
          }
          const channel: Channel = {
            id: apiChannel.id,
            shortId: apiChannel.shortId,
            name: apiChannel.name,
            type: apiChannel.type,
            description: apiChannel.description,
            createdAt: new Date(apiChannel.created_at),
            updatedAt: new Date(apiChannel.updated_at),
            members: apiChannel.members.map(m => ({
              id: m.id,
              userId: m.user_id,
              channelId: m.channel_id,
              role: m.role,
              joinedAt: new Date(m.joined_at)
            }))
          };
          setActiveChannel(channel);
          setError(null);
        })
        .catch(error => {
          console.error('Failed to load channel:', error);
          setError('Failed to load channel');
        });
    }
  }, [channelId, loadChannel, setActiveChannel]);

  // Load messages
  useEffect(() => {
    if (channelId) {
      loadMessages()
        .then(apiMessages => {
          if (!apiMessages) {
            console.warn('No messages returned from API');
            setMessages(channelId, []);
            return;
          }
          const messages: Message[] = apiMessages.map(m => ({
            id: m.id,
            content: m.content,
            userId: m.user_id,
            channelId: m.channel_id,
            type: m.type,
            createdAt: new Date(m.created_at),
            updatedAt: m.updated_at ? new Date(m.updated_at) : undefined
          }));
          setMessages(channelId, messages);
        })
        .catch(error => {
          console.error('Failed to load messages:', error);
          setMessages(channelId, []); // Set empty array on error
        });
    }
  }, [channelId, loadMessages, setMessages]);

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!messageContent.trim() || !channelId) return;

    try {
      const apiMessage = await sendMessageApi({
        content: messageContent.trim(),
        type: MessageType.TEXT
      });

      if (!apiMessage) {
        console.error('No response from send message API');
        return;
      }

      const message: Message = {
        id: apiMessage.id,
        content: apiMessage.content,
        userId: apiMessage.user_id,
        channelId: apiMessage.channel_id,
        type: apiMessage.type,
        createdAt: new Date(apiMessage.created_at),
        updatedAt: apiMessage.updated_at ? new Date(apiMessage.updated_at) : undefined
      };

      sendMessage(channelId, message);
      setMessageContent("");
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (isLoadingChannel) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading channel...</p>
        </div>
      </div>
    );
  }

  if (error || channelError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-red-500">
          <p>{error || channelError?.message || 'Failed to load channel'}</p>
        </div>
      </div>
    );
  }

  if (!activeChannel) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p>Channel not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold"># {activeChannel.name}</h1>
        {activeChannel.description && (
          <p className="text-gray-600 mt-1">{activeChannel.description}</p>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p>Loading messages...</p>
            </div>
          </div>
        ) : messagesError ? (
          <div className="text-center text-red-500">
            <p>{messagesError.message || 'Failed to load messages'}</p>
          </div>
        ) : channelId && messages[channelId] ? (
          messages[channelId].map((message: Message) => (
            <div key={message.id} className="mb-4">
              <div className="font-bold">{message.userId}</div>
              <div>{message.content}</div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">No messages yet</div>
        )}
      </div>
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={messageContent}
            onChange={e => setMessageContent(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border rounded"
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={isSending || !messageContent.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}; 