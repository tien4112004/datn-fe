import { getBackendUrl } from '@/shared/utils/backend-url';
import type { MindmapApiService } from '../types/service';
import MindmapMockService from './mock';
import MindmapServiceImpl from './service';
import { api, webviewApi, getApiClientMode, getApiMode, API_MODE } from '@aiprimary/api';

export const useMindmapApiService = (): MindmapApiService => {
  return getMindmapApiService();
};

/**
 * Get mindmap API service with webview mode support.
 *
 * This function automatically detects if running in a mobile webview and returns
 * the appropriate service:
 * - MindmapServiceImpl + webviewApi: Uses localStorage token + Authorization header (webview)
 * - MindmapServiceImpl + api: Uses cookies + withCredentials (web)
 * - MindmapMockService: Uses mock data (mock mode)
 */
export const getMindmapApiService = (): MindmapApiService => {
  const baseUrl = getBackendUrl();
  const clientMode = getApiClientMode();

  // If in webview mode, use the webview service
  if (clientMode === 'webview') {
    return new MindmapServiceImpl(baseUrl, webviewApi);
  }

  if (getApiMode() === API_MODE.mock) {
    return new MindmapMockService(baseUrl);
  }

  return new MindmapServiceImpl(baseUrl, api);
};
