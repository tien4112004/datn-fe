import useBackendUrlStore from '@/features/settings/stores/useBackendUrlStore';
import type { ModelApiService } from '../types/service';
import ModelMockService from './mock';
import ModelRealApiService from './service';
import { createApiServiceFactory, getApiServiceFactory } from '@/shared/api';

export const useModelApiService = (isLoader: boolean): ModelApiService => {
  const baseUrl = useBackendUrlStore((state) => state.backendUrl);

  if (isLoader) {
    return getApiServiceFactory<ModelApiService>(ModelMockService, ModelRealApiService, baseUrl);
  }
  return createApiServiceFactory<ModelApiService>(ModelMockService, ModelRealApiService, baseUrl);
};
