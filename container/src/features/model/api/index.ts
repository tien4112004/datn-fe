import type { ModelApiService } from '../types/service';
import ModelMockService from './mock';
import ModelRealApiService from './service';
import { createApiServiceFactory } from '@/shared/api';

export const useModelApiService = (): ModelApiService => {
  return createApiServiceFactory<ModelApiService>(ModelMockService, ModelRealApiService);
};
