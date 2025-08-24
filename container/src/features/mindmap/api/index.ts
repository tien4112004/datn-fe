import type { MindmapApiService } from '../types/service';
import MindmapMockService from './mock';
import MindmapRealApiService from './service';
import { createApiServiceFactory, getApiServiceFactory } from '@/shared/api';

export const useMindmapApiService = (isLoader: boolean): MindmapApiService => {
  if (isLoader) {
    return getApiServiceFactory<MindmapApiService>(MindmapMockService, MindmapRealApiService);
  }
  return createApiServiceFactory<MindmapApiService>(MindmapMockService, MindmapRealApiService);
};
