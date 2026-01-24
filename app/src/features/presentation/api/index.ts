import type { PresentationApiService } from '../types/service';
import PresentationService from './service';
import { api, webviewApi, getApiClientMode, type ApiClient } from '@aiprimary/api';
import { getBackendUrl } from '@/shared/utils/backend-url';

export const usePresentationApiService = (): PresentationApiService => {
  return getPresentationApiService();
};

/**
 * Get presentation API service with webview mode support.
 *
 * This function automatically detects if running in a mobile webview and returns
 * the appropriate service:
 * - PresentationService + webviewApi: Uses localStorage token + Authorization header (webview)
 * - PresentationService + api: Uses cookies + withCredentials (web)
 */
export const getPresentationApiService = (apiClient?: ApiClient): PresentationApiService => {
  const baseUrl = getBackendUrl();

  if (apiClient) {
    return new PresentationService(apiClient, baseUrl);
  }

  const clientMode = getApiClientMode();

  // If in webview mode, use the webview service
  if (clientMode === 'webview') {
    return new PresentationService(webviewApi, baseUrl);
  }

  return new PresentationService(api, baseUrl);
};
