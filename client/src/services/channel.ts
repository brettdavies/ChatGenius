import { Channel, ChannelMember } from '../types/channel.types';
import { handleResponse } from './utils';

export async function getChannels(
  limit = 20,
  offset = 0,
  includeArchived = false
): Promise<{ channels: Channel[]; total: number }> {
  const url = `/api/channels?limit=${limit}&offset=${offset}&includeArchived=${includeArchived}`;
  console.log('[Channels] Fetching channels:', url);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  const data = await handleResponse<{ message: string; code: string; data: { channels: Channel[]; total: number } }>(response);
  return data.data;
}

export async function getChannelById(channelId: string): Promise<Channel> {
  const response = await fetch(`/api/channels/${channelId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  const data = await handleResponse<{ message: string; code: string; data: { channel: Channel } }>(response);
  return data.data.channel;
}

export async function createChannel(name: string, description?: string): Promise<Channel> {
  const response = await fetch('/api/channels', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ name, description }),
  });

  const data = await handleResponse<{ message: string; code: string; data: { channel: Channel } }>(response);
  return data.data.channel;
}

export async function updateChannel(channelId: string, updates: Partial<Channel>): Promise<Channel> {
  const response = await fetch(`/api/channels/${channelId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(updates),
  });

  const data = await handleResponse<{ message: string; code: string; data: { channel: Channel } }>(response);
  return data.data.channel;
}

export async function deleteChannel(channelId: string): Promise<void> {
  const response = await fetch(`/api/channels/${channelId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  await handleResponse<{ message: string; code: string }>(response);
}

export async function getChannelMembers(channelId: string): Promise<ChannelMember[]> {
  const response = await fetch(`/api/channels/${channelId}/members`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  const data = await handleResponse<{ message: string; code: string; data: { members: ChannelMember[] } }>(response);
  return data.data.members;
}

export async function addChannelMember(channelId: string, userId: string, role: string): Promise<void> {
  const response = await fetch(`/api/channels/${channelId}/members`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ userId, role }),
  });

  await handleResponse<{ message: string; code: string }>(response);
}

export async function removeChannelMember(channelId: string, userId: string): Promise<void> {
  const response = await fetch(`/api/channels/${channelId}/members/${userId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  await handleResponse<{ message: string; code: string }>(response);
}

export async function searchChannels(query: string): Promise<Channel[]> {
  const response = await fetch(`/api/channels/search?q=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  const data = await handleResponse<{ message: string; code: string; data: { channels: Channel[] } }>(response);
  return data.data.channels;
}

export async function getMyChannels(): Promise<Channel[]> {
  const response = await fetch('/api/channels/my', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  const data = await handleResponse<{ message: string; code: string; data: { channels: Channel[] } }>(response);
  return data.data.channels;
} 