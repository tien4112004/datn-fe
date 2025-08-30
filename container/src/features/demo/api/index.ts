import useBackendUrlStore from '@/features/settings/stores/useBackendUrlStore';
import type { DemoApiService } from '../types/service';
import DemoMockService from './mock';
import DemoRealApiService from './service';
import { createApiServiceFactory } from '@/shared/api';

export const useDemoApiService = (): DemoApiService => {
  const backendUrl = useBackendUrlStore((state) => state.backendUrl);
  return createApiServiceFactory<DemoApiService>(DemoMockService, DemoRealApiService, backendUrl);
};
