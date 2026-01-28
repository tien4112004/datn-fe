import { getBackendUrl } from '@/shared/utils/backend-url';
import type { SharedResourceApiService } from './service';
import SharedResourceService from './service';
import { api, webviewApi, getApiClientMode, type ApiClient } from '@aiprimary/api';

export const useSharedResourceApiService = (): SharedResourceApiService => {
  return getSharedResourceApiService();
};

/**
 * Get shared resource API service with webview mode support.
 */
export const getSharedResourceApiService = (apiClient?: ApiClient): SharedResourceApiService => {
  const baseUrl = getBackendUrl();

  if (apiClient) {
    return new SharedResourceService(apiClient, baseUrl);
  }

  const clientMode = getApiClientMode();

  // If in webview mode, use the webview service
  if (clientMode === 'webview') {
    return new SharedResourceService(webviewApi, baseUrl);
  }

  return new SharedResourceService(api, baseUrl);
};
