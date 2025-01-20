import { Message, MessageReaction } from '../types/message.types';
import { handleResponse } from './utils';

export interface GetMessagesResponse {
  messages: Message[];
  total: number;
}

export interface SearchMessagesResponse {
  messages: Message[];
  total: number;
}

export async function getMessages(
  channelId: string,
  limit = 50,
  before?: Date,
  after?: Date,
  threadId?: string
): Promise<GetMessagesResponse> {
  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  if (before) params.append('before', before.toISOString());
  if (after) params.append('after', after.toISOString());
  if (threadId) params.append('threadId', threadId);

  const url = `/api/messages/channel/${channelId}?${params.toString()}`;
  console.log('[Messages] Fetching messages:', url);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  const data = await handleResponse<{ message: string; code: string; data: GetMessagesResponse }>(response);
  return data.data;
}

export async function searchMessages(
  query: string,
  channelId?: string,
  limit = 50,
  offset = 0
): Promise<SearchMessagesResponse> {
  const params = new URLSearchParams();
  params.append('query', query);
  params.append('limit', limit.toString());
  params.append('offset', offset.toString());
  if (channelId) params.append('channelIds', channelId);

  const url = `/api/messages/search?${params.toString()}`;
  console.log('[Messages] Searching messages:', url);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  const data = await handleResponse<{ message: string; code: string; data: SearchMessagesResponse }>(response);
  return data.data;
}

export async function getMessage(messageId: string): Promise<Message> {
  const response = await fetch(`/api/messages/${messageId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  const data = await handleResponse<{ message: string; code: string; data: { message: Message } }>(response);
  return data.data.message;
}

export async function createMessage(channelId: string, content: string, threadId?: string): Promise<Message> {
  const response = await fetch('/api/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ channelId, content, threadId }),
  });

  const data = await handleResponse<{ message: string; code: string; data: { message: Message } }>(response);
  return data.data.message;
}

export async function updateMessage(messageId: string, content: string): Promise<Message> {
  const response = await fetch(`/api/messages/${messageId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ content }),
  });

  const data = await handleResponse<{ message: string; code: string; data: { message: Message } }>(response);
  return data.data.message;
}

export async function deleteMessage(messageId: string): Promise<void> {
  const response = await fetch(`/api/messages/${messageId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  await handleResponse<void>(response);
}

export async function addReaction(messageId: string, emoji: string): Promise<MessageReaction> {
  const response = await fetch(`/api/messages/${messageId}/reactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ emoji }),
  });

  const data = await handleResponse<{ message: string; code: string; data: { reaction: MessageReaction } }>(response);
  return data.data.reaction;
}

export async function removeReaction(messageId: string, emoji: string): Promise<void> {
  const response = await fetch(`/api/messages/${messageId}/reactions/${emoji}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  await handleResponse<void>(response);
}

export async function getReactions(messageId: string): Promise<MessageReaction[]> {
  const response = await fetch(`/api/messages/${messageId}/reactions`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  const data = await handleResponse<{ message: string; code: string; data: { reactions: MessageReaction[] } }>(response);
  return data.data.reactions;
}

export async function getThreadMessages(threadId: string): Promise<GetMessagesResponse> {
  const response = await fetch(`/api/messages/thread/${threadId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  const data = await handleResponse<{ message: string; code: string; data: GetMessagesResponse }>(response);
  return data.data;
} 