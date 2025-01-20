import { Response } from 'express';

export interface ApiError {
  message: string;
  code: string;
  path?: string;
}

export interface ApiResponse<T = any> {
  message: string;
  code: string;
  errors?: ApiError[];
  data?: T;
}

/**
 * Creates a standardized API response object
 */
export function createResponse<T>(message: string, code: string, data?: T): ApiResponse<T> {
  return {
    message,
    code,
    ...(data && { data })
  };
}

/**
 * Creates a standardized error response object
 */
export function createErrorResponse(message: string, code: string, errors?: ApiError[]): ApiResponse {
  return {
    message,
    code,
    ...(errors && { errors })
  };
}

/**
 * Sends a standardized success response
 */
export function sendResponse<T>(res: Response, message: string, code: string, data?: T, status: number = 200): void {
  res.status(status).json(createResponse(message, code, data));
}

/**
 * Sends a standardized error response
 */
export function sendError(res: Response, message: string, code: string, errors?: ApiError[], status: number = 400): void {
  res.status(status).json(createErrorResponse(message, code, errors));
} 