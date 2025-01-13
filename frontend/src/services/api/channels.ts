import { Channel, CreateChannelData, UpdateChannelData, ChannelResponse, ChannelsResponse } from '../types/channel';
import type { AxiosError } from 'axios';

// Base URL for the channels API
const API_BASE = '/api/channels';

// Define type for loggable data
type LoggableData = CreateChannelData | UpdateChannelData | Record<string, unknown>;

// Add a helper to log request details
const logRequest = (method: string, url: string, data?: LoggableData) => {
  console.log(`[API] ${method} ${url}`);
  if (data) console.log('[API] Request Data:', data);
};

// Helper to get auth headers
function getAuthHeaders(token: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

export type ChannelData = {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
};

export async function createChannel(data: CreateChannelData, token: string): Promise<Channel | null> {
  try {
    logRequest('POST', API_BASE, data);
    const headers = getAuthHeaders(token);
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error('[API] Error creating channel:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('[API] Error details:', errorText);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('[API] Error creating channel:', error);
    throw error;
  }
}

export async function getChannel(id: string, token: string): Promise<ChannelResponse> {
  try {
    const headers = getAuthHeaders(token);
    const response = await fetch(`${API_BASE}/${id}`, {
      credentials: 'include',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.message || 'Failed to fetch channel' };
    }

    const channel = await response.json();
    return { data: channel };
  } catch (error) {
    console.error('Failed to fetch channel:', error);
    return { error: error instanceof Error ? error.message : 'Failed to fetch channel' };
  }
}

export async function getChannels(token: string): Promise<ChannelsResponse> {
  try {
    const response = await axios.get<Channel[]>('/api/channels', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Failed to fetch channels:', axiosError.message);
    return { error: axiosError.message || 'Failed to fetch channels' };
  }
}

export async function updateChannel(id: string, data: UpdateChannelData, token: string): Promise<ChannelResponse> {
  try {
    const headers = getAuthHeaders(token);
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.message || 'Failed to update channel' };
    }

    const channel = await response.json();
    return { data: channel };
  } catch (err) {
    console.error('Failed to update channel:', err);
    throw err;
  }
}

export async function deleteChannel(id: string, token: string): Promise<{ error?: string }> {
  try {
    const headers = getAuthHeaders(token);
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.message || 'Failed to delete channel' };
    }

    return {};
  } catch (err) {
    console.error('Failed to delete channel:', err);
    throw err;
  }
}

export async function archiveChannel(id: string, archived: boolean, token: string): Promise<{ error?: string }> {
  try {
    const headers = getAuthHeaders(token);
    const response = await fetch(`${API_BASE}/${id}/archive`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ archived }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.message || 'Failed to archive channel' };
    }

    return {};
  } catch (err) {
    console.error('Failed to archive channel:', err);
    throw err;
  }
} 