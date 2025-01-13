import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '../api';

type ApiMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

interface ApiOptions {
  onError?: (error: unknown) => void;
}

export function createAuthenticatedApi(defaultOptions: ApiOptions = {}) {
  function createMethod(method: ApiMethod) {
    return function useAuthenticatedMethod<TResponse = unknown, TBody = unknown>(
      url: string,
      body?: TBody,
      options: ApiOptions = {}
    ) {
      const [isLoading, setIsLoading] = useState(false);
      const [error, setError] = useState<unknown>(null);
      const mergedOptions = { ...defaultOptions, ...options };

      const execute = useCallback(async () => {
        try {
          setIsLoading(true);
          setError(null);
          const response = method === 'get' || method === 'delete'
            ? await api[method]<TResponse>(url)
            : await api[method]<TResponse>(url, body);
          return response.data;
        } catch (err) {
          setError(err);
          mergedOptions.onError?.(err);
          throw err;
        } finally {
          setIsLoading(false);
        }
      }, [url, body, mergedOptions]);

      return {
        execute,
        isLoading,
        error
      };
    };
  }

  return {
    useGet: createMethod('get'),
    usePost: createMethod('post'),
    usePut: createMethod('put'),
    useDelete: createMethod('delete'),
    usePatch: createMethod('patch'),
  };
}

// Create a default authenticated API instance
export const authenticatedApi = createAuthenticatedApi({
  onError: (err) => console.error('API Error:', err)
});

// Example usage:
// function YourComponent() {
//   const { execute: fetchChannels, isLoading } = authenticatedApi.useGet<Channel[]>('/channels');
//   const { execute: createChannel } = authenticatedApi.usePost<Channel>('/channels');
// } 