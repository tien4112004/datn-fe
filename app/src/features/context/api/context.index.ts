import { api, getBackendUrl, type ApiClient } from '@aiprimary/api';
import type { ContextApiService } from './context.service';
import ContextService from './context.service';

export const useContextApiService = (): ContextApiService => {
  return new ContextService(api, getBackendUrl());
};

export const getContextApiService = (apiClient: ApiClient = api): ContextApiService => {
  return new ContextService(apiClient, getBackendUrl());
};
