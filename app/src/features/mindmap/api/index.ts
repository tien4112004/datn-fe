import { getBackendUrl } from '@/shared/utils/backend-url';
import type { MindmapApiService } from '../types/service';
import MindmapService from './service';
import { api, webviewApi, getApiClientMode, type ApiClient } from '@aiprimary/api';

export const useMindmapApiService = (): MindmapApiService => {
  return getMindmapApiService();
};

/**
 * Get mindmap API service with webview mode support.
 *
 * This function automatically detects if running in a mobile webview and returns
 * the appropriate service:
 * - MindmapService + webviewApi: Uses localStorage token + Authorization header (webview)
 * - MindmapService + api: Uses cookies + withCredentials (web)
 */
export const getMindmapApiService = (apiClient?: ApiClient): MindmapApiService => {
  const baseUrl = getBackendUrl();

  if (apiClient) {
    return new MindmapService(apiClient, baseUrl);
  }

  const clientMode = getApiClientMode();

  // If in webview mode, use the webview service
  if (clientMode === 'webview') {
    return new MindmapService(webviewApi, baseUrl);
  }

  return new MindmapService(api, baseUrl);
};
