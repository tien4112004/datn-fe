import { getBackendUrl } from '@/shared/utils/backend-url';
import type { MindmapApiService } from '../types/service';
import MindmapMockService from './mock';
import MindmapRealApiService from './service';
import { createApiServiceFactory, getApiServiceFactory } from '@/shared/api';
import { webViewApi } from '@aiprimary/api';

export const useMindmapApiService = (): MindmapApiService => {
  const baseUrl = getBackendUrl();
  return createApiServiceFactory<MindmapApiService>(MindmapMockService, MindmapRealApiService, baseUrl);
};

export const getMindmapApiService = (): MindmapApiService => {
  const baseUrl = getBackendUrl();

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
