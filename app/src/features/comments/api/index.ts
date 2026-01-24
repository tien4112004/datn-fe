import { api, webviewApi, getApiClientMode, type ApiClient } from '@aiprimary/api';
import { getBackendUrl } from '@/shared/utils/backend-url';
import type { CommentApiService } from '../types/service';
import CommentRealApiService from './service';

export const useCommentApiService = (): CommentApiService => {
  return getCommentApiService();
};

/**
 * Get comment API service with webview mode support.
 *
 * This function automatically detects if running in a mobile webview and returns
 * the appropriate service:
 * - CommentRealApiService + webviewApi: Uses localStorage token + Authorization header (webview)
 * - CommentRealApiService + api: Uses cookies + withCredentials (web)
 */
export const getCommentApiService = (apiClient?: ApiClient): CommentApiService => {
  const baseUrl = getBackendUrl();

  if (apiClient) {
    return new CommentRealApiService(apiClient, baseUrl);
  }

  const clientMode = getApiClientMode();

  // If in webview mode, use the webview service
  if (clientMode === 'webview') {
    return new CommentRealApiService(webviewApi, baseUrl);
  }

  return new CommentRealApiService(api, baseUrl);
};
