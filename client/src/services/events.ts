import { handleResponse } from './utils';

export async function startTyping(channelId: string): Promise<void> {
  const response = await fetch(`/api/events/channels/${channelId}/typing/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  await handleResponse<void>(response);
}

export async function stopTyping(channelId: string): Promise<void> {
  const response = await fetch(`/api/events/channels/${channelId}/typing/stop`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  await handleResponse<void>(response);
}

export async function updatePresence(channelId: string, isOnline: boolean): Promise<void> {
  const response = await fetch(`/api/events/channels/${channelId}/presence`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ isOnline }),
  });

  await handleResponse<void>(response);
}

export function subscribeToChannelEvents(channelId: string, onEvent: (event: any) => void): () => void {
  const eventSource = new EventSource(`/api/events/channels/${channelId}/events`, {
    withCredentials: true,
  });

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onEvent(data);
    } catch (error) {
      console.error('[Events] Error parsing SSE event:', error);
    }
  };

  eventSource.onerror = (error) => {
    console.error('[Events] SSE connection error:', error);
  };

  return () => {
    eventSource.close();
  };
} 