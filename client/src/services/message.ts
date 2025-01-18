import type { Message } from '../types/message.types';
import { handleResponse } from './utils';

export async function getMessages(channelId: string, options?: { before?: Date; after?: Date; limit?: number }): Promise<{ messages: Message[]; total: number }> {
  console.log('[MessageService] Getting messages for channel:', channelId, 'with options:', options);
  const params = new URLSearchParams();
  if (options?.before) params.append('before', options.before.toISOString());
  if (options?.after) params.append('after', options.after.toISOString());
  if (options?.limit) params.append('limit', options.limit.toString());

  const url = `/api/messages/channel/${channelId}?${params.toString()}`;
  console.log('[MessageService] Fetching messages from URL:', url);
  
  try {
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('[MessageService] Response status:', response.status);
    const data = await handleResponse(response);
    console.log('[MessageService] Received messages:', data.messages?.length, 'Total:', data.total);
    return data;
  } catch (error) {
    console.error('[MessageService] Error fetching messages:', error);
    throw error;
  }
}

export async function getThreadMessages(threadId: string, options?: { before?: Date; limit?: number }): Promise<{ messages: Message[]; total: number }> {
  console.log('[MessageService] Getting thread messages for:', threadId, 'with options:', options);
  const params = new URLSearchParams();
  if (options?.before) params.append('before', options.before.toISOString());
  if (options?.limit) params.append('limit', options.limit.toString());

  const url = `/api/messages/thread/${threadId}?${params.toString()}`;
  console.log('[MessageService] Fetching thread messages from URL:', url);

  try {
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('[MessageService] Response status:', response.status);
    const data = await handleResponse(response);
    console.log('[MessageService] Received thread messages:', data.messages?.length, 'Total:', data.total);
    return data;
  } catch (error) {
    console.error('[MessageService] Error fetching thread messages:', error);
    throw error;
  }
}

export async function createMessage(channelId: string, content: string, threadId?: string): Promise<Message> {
  console.log('[MessageService] Creating message:', { channelId, content, threadId });
  try {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        channelId,
        content,
        threadId,
      }),
    });
    console.log('[MessageService] Response status:', response.status);
    const message = await handleResponse(response);
    console.log('[MessageService] Created message:', message);
    return message;
  } catch (error) {
    console.error('[MessageService] Error creating message:', error);
    throw error;
  }
}

export async function updateMessage(messageId: string, content: string): Promise<Message> {
  console.log('[MessageService] Updating message:', messageId, 'with content:', content);
  try {
    const response = await fetch(`/api/messages/${messageId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ content }),
    });
    console.log('[MessageService] Response status:', response.status);
    const message = await handleResponse(response);
    console.log('[MessageService] Updated message:', message);
    return message;
  } catch (error) {
    console.error('[MessageService] Error updating message:', error);
    throw error;
  }
}

export async function deleteMessage(messageId: string): Promise<void> {
  console.log('[MessageService] Deleting message:', messageId);
  try {
    const response = await fetch(`/api/messages/${messageId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('[MessageService] Response status:', response.status);
    await handleResponse(response);
    console.log('[MessageService] Message deleted successfully');
  } catch (error) {
    console.error('[MessageService] Error deleting message:', error);
    throw error;
  }
}

export async function addReaction(messageId: string, emoji: string): Promise<void> {
  console.log('[MessageService] Adding reaction:', emoji, 'to message:', messageId);
  try {
    const response = await fetch(`/api/messages/${messageId}/reactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ emoji }),
    });
    console.log('[MessageService] Response status:', response.status);
    await handleResponse(response);
    console.log('[MessageService] Reaction added successfully');
  } catch (error) {
    console.error('[MessageService] Error adding reaction:', error);
    throw error;
  }
}

export async function removeReaction(messageId: string, emoji: string): Promise<void> {
  console.log('[MessageService] Removing reaction:', emoji, 'from message:', messageId);
  try {
    const response = await fetch(`/api/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('[MessageService] Response status:', response.status);
    await handleResponse(response);
    console.log('[MessageService] Reaction removed successfully');
  } catch (error) {
    console.error('[MessageService] Error removing reaction:', error);
    throw error;
  }
}

export async function searchMessages(query: string, options?: { channelIds?: string[]; userId?: string; limit?: number; offset?: number }): Promise<{ messages: Message[]; total: number }> {
  console.log('[MessageService] Searching messages with query:', query, 'options:', options);
  const params = new URLSearchParams({ query });
  if (options?.channelIds) params.append('channelIds', options.channelIds.join(','));
  if (options?.userId) params.append('userId', options.userId);
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.offset) params.append('offset', options.offset.toString());

  const url = `/api/messages/search?${params.toString()}`;
  console.log('[MessageService] Searching messages at URL:', url);

  try {
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('[MessageService] Response status:', response.status);
    const data = await handleResponse(response);
    console.log('[MessageService] Search results:', data.messages?.length, 'Total:', data.total);
    return data;
  } catch (error) {
    console.error('[MessageService] Error searching messages:', error);
    throw error;
  }
} 