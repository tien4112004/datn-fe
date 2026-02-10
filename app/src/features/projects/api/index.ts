import { getBackendUrl } from '@/shared/utils/backend-url';
import type { ExamplePromptsApiService } from './service';
import ExamplePromptsService from './service';
import { api, webviewApi, getApiClientMode, type ApiClient } from '@aiprimary/api';

export const getExamplePromptsApiService = (apiClient?: ApiClient): ExamplePromptsApiService => {
  const baseUrl = getBackendUrl();

  if (apiClient) {
    return new ExamplePromptsService(apiClient, baseUrl);
  }

  const clientMode = getApiClientMode();

  if (clientMode === 'webview') {
    return new ExamplePromptsService(webviewApi, baseUrl);
  }

  return new ExamplePromptsService(api, baseUrl);
};
