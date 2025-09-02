import { getBackendUrl } from '@/shared/utils/backend-url';
import type { MindmapApiService } from '../types/service';
import MindmapMockService from './mock';
import MindmapRealApiService from './service';
import { createApiServiceFactory, getApiServiceFactory } from '@/shared/api';

export const useMindmapApiService = (): MindmapApiService => {
  const baseUrl = getBackendUrl();
  return createApiServiceFactory<MindmapApiService>(MindmapMockService, MindmapRealApiService, baseUrl);
};

export const getMindmapApiService = (): MindmapApiService => {
  const baseUrl = getBackendUrl();

  return getApiServiceFactory<MindmapApiService>(MindmapMockService, MindmapRealApiService, baseUrl);
};
