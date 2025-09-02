import type { ModelApiService } from '../types/service';
import ModelMockService from './mock';
import ModelRealApiService from './service';
import { createApiServiceFactory, getApiServiceFactory } from '@/shared/api';
import { getBackendUrl } from '@/shared/utils/backend-url';

export const useModelApiService = (): ModelApiService => {
  const baseUrl = getBackendUrl();
  return createApiServiceFactory<ModelApiService>(ModelMockService, ModelRealApiService, baseUrl);
};

export const getModelApiService = (): ModelApiService => {
  const baseUrl = getBackendUrl();
  return getApiServiceFactory<ModelApiService>(ModelMockService, ModelRealApiService, baseUrl);
};
