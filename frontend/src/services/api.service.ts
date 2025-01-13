import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { useCallback, useState } from 'react';
import { appConfig } from '@/config';
import { API_ENDPOINTS, HTTP_STATUS, ERROR_MESSAGES, LOCAL_STORAGE_KEYS } from '@/constants';

interface UseApiResponse<T, D = unknown> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  execute: (data?: D) => Promise<T>;
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

export const useApiGet = <T>(endpoint: string, config?: AxiosRequestConfig): UseApiResponse<T> => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.get<T>(endpoint, config);
      setData(response);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(ERROR_MESSAGES.SERVER_ERROR);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, config]);

  return { data, error, isLoading, execute };
};

export const useApiPost = <T, D = unknown>(endpoint: string, config?: AxiosRequestConfig): UseApiResponse<T, D> => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(async (postData?: D) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.post<T>(endpoint, postData, config);
      setData(response);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(ERROR_MESSAGES.SERVER_ERROR);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, config]);

  return { data, error, isLoading, execute };
};

class ApiService {
  private client: AxiosInstance;
  private retryCount: number = 0;

  constructor() {
    this.client = axios.create({
      baseURL: appConfig.api.baseUrl + '/api',
      timeout: appConfig.api.timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add auth token if available
        const token = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiErrorResponse>) => {
        if (!error.response) {
          throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
        }

        // Handle unauthorized errors
        if (error.response.status === HTTP_STATUS.UNAUTHORIZED) {
          // Try to refresh token
          if (this.retryCount < appConfig.api.retryAttempts) {
            this.retryCount++;
            try {
              await this.refreshToken();
              // Retry the original request
              if (error.config) {
                return this.client(error.config);
              }
              throw new Error(ERROR_MESSAGES.SERVER_ERROR);
            } catch {
              // If refresh fails, redirect to login
              window.location.href = API_ENDPOINTS.AUTH.LOGIN;
              throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
            }
          }
        }

        // Handle other errors
        const errorMessage = this.getErrorMessage(error);
        throw new Error(errorMessage);
      }
    );
  }

  private async refreshToken() {
    const refreshToken = localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshToken) {
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }

    try {
      const response = await this.client.post(API_ENDPOINTS.AUTH.REFRESH, {
        refresh_token: refreshToken
      });

      const { access_token, refresh_token } = response.data;
      localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN, access_token);
      localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, refresh_token);
    } catch (error) {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
      throw error;
    }
  }

  private getErrorMessage(error: AxiosError<ApiErrorResponse>): string {
    if (!error.response) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }

    switch (error.response.status) {
      case HTTP_STATUS.BAD_REQUEST:
        return error.response.data?.message || error.response.data?.error || ERROR_MESSAGES.INVALID_FORMAT;
      case HTTP_STATUS.UNAUTHORIZED:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case HTTP_STATUS.FORBIDDEN:
        return ERROR_MESSAGES.FORBIDDEN;
      case HTTP_STATUS.NOT_FOUND:
        return ERROR_MESSAGES.NOT_FOUND;
      default:
        return ERROR_MESSAGES.SERVER_ERROR;
    }
  }

  // Regular methods
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  public async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  public async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const apiService = new ApiService(); 