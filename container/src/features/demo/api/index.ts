import type { DemoApiService } from '../types/service';
import DemoMockService from './mock';
import DemoRealApiService from './service';
import { createApiServiceFactory } from '@/shared/api';

export const useDemoApiService = (): DemoApiService => {
  return createApiServiceFactory<DemoApiService>(DemoMockService, DemoRealApiService);
};
