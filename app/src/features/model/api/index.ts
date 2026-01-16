import type { ModelApiService } from '../types/service';
import ModelService from './service';
import { api, type ApiClient } from '@aiprimary/api';
import { getBackendUrl } from '@/shared/utils/backend-url';

export const useModelApiService = (): ModelApiService => {
  return new ModelService(api, getBackendUrl());
};

export const getModelApiService = (apiClient: ApiClient = api): ModelApiService => {
  return new ModelService(apiClient, getBackendUrl());
};
