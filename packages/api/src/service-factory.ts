import type { ApiClient } from './client';
import api from './client';
import webViewApi from './webViewClient';

/**
 * Get the default API client for the current environment
 * Automatically detects webview context and returns appropriate client
 */
export function getDefaultApiClient(): ApiClient {
  // Auto-detect webview context if needed
  if (typeof window !== 'undefined' && (window as any).acquireVsCodeApi) {
    return webViewApi as ApiClient;
  }
  return api;
}

/**
 * Base interface for all services (simplified - no getType needed)
 * Services using dependency injection pattern should implement this
 */
export interface BaseService {
  readonly baseUrl: string;
}
