import type { ModelApiService } from '../types/service';
import ModelMockService from './mock';
import ModelRealApiService from './service';
import { createApiServiceFactory, getApiServiceFactory } from '@/shared/api';

export const useModelApiService = (isLoader: boolean): ModelApiService => {
  if (isLoader) {
    return getApiServiceFactory<ModelApiService>(ModelMockService, ModelRealApiService);
  }
  return createApiServiceFactory<ModelApiService>(ModelMockService, ModelRealApiService);
};
