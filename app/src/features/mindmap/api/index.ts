import { getBackendUrl } from '@/shared/utils/backend-url';
import type { MindmapApiService } from '../types/service';
import MindmapMockService from './mock';
import MindmapRealApiService from './service';
import MindmapWebviewApiService from './webview-service';
import { createApiServiceFactory, getApiServiceFactory } from '@/shared/api';
import { webViewApi } from '@aiprimary/api';
import { getApiClientMode } from '@aiprimary/api';

export const useMindmapApiService = (): MindmapApiService => {
  const baseUrl = getBackendUrl();
  return createApiServiceFactory<MindmapApiService>(MindmapMockService, MindmapRealApiService, baseUrl);
};

/**
 * Get mindmap API service with webview mode support.
 *
 * This function automatically detects if running in a mobile webview and returns
 * the appropriate service:
 * - MindmapWebviewApiService: Uses localStorage token + Authorization header (webview)
 * - MindmapRealApiService: Uses cookies + withCredentials (web)
 * - MindmapMockService: Uses mock data (mock mode)
 */
export const getMindmapApiService = (): MindmapApiService => {
  const baseUrl = getBackendUrl();
  const clientMode = getApiClientMode();

  // console.info('[Mindmap API Service]', {
  //   baseUrl,
  //   clientMode,
  //   pathname: window.location.pathname,
  // });

  // If in webview mode, use the webview service
  if (clientMode === 'webview') {
    // console.info('[Mindmap API Service] Using MindmapWebviewApiService (token-based auth)');
    return new MindmapWebviewApiService(baseUrl);
  }

  // Otherwise use the standard factory (mock or real based on API mode)
  // console.info('[Mindmap API Service] Using standard factory (cookie-based auth)');
  return getApiServiceFactory<MindmapApiService>(MindmapMockService, MindmapRealApiService, baseUrl);
};

/**
 * Get mindmap API service configured for WebView usage (no credentials/cookies).
 * Use this for embedded pages like MindmapEmbedPage that run in Flutter WebView.
 */
export const getMindmapWebViewApiService = (): MindmapApiService => {
  const baseUrl = getBackendUrl();

  // Always use real API service for webview (no mock support needed)
  return new MindmapRealApiService(baseUrl, webViewApi);
};
