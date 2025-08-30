import useBackendUrlStore from '@/features/settings/stores/useBackendUrlStore';
import type { MindmapApiService } from '../types/service';
import MindmapMockService from './mock';
import MindmapRealApiService from './service';
import { createApiServiceFactory, getApiServiceFactory } from '@/shared/api';

export const useMindmapApiService = (isLoader: boolean): MindmapApiService => {
  const backendUrl = useBackendUrlStore((state) => state.backendUrl);

  if (isLoader) {
    return getApiServiceFactory<MindmapApiService>(MindmapMockService, MindmapRealApiService, backendUrl);
  }
  return createApiServiceFactory<MindmapApiService>(MindmapMockService, MindmapRealApiService, backendUrl);
};
