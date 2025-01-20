import type { Channel } from '../types/channel.types';
import { handleResponse } from './utils';

export async function getChannels(): Promise<{ channels: Channel[]; total: number }> {
  const response = await fetch('/api/channels', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  return handleResponse(response);
}

export async function getChannelById(channelId: string): Promise<Channel> {
  const response = await fetch(`/api/channels/${channelId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  const data = await handleResponse(response);
  return data.channel;
}

export async function updateChannel(channelId: string, updates: { name?: string; description?: string }): Promise<Channel> {
  const response = await fetch(`/api/channels/${channelId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(updates),
  });

  const data = await handleResponse(response);
  return data.channel;
}

export async function deleteChannel(channelId: string): Promise<void> {
  const response = await fetch(`/api/channels/${channelId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  await handleResponse(response);
}

export async function getMyChannels(): Promise<Channel[]> {
  const response = await fetch('/api/channels/my', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  const data = await handleResponse(response);
  return data.channels;
} 