import { useApiSwitching } from '@/shared/context/api-switching';
import DemoMockService from './mock';
import DemoRealApiService from './service';
import { type DemoApiService } from './interface';

export const useDemoApiService = (): DemoApiService => {
  const { apiMode } = useApiSwitching();

  console.log('Current API Mode:', apiMode);

  return apiMode === 'mock' ? new DemoMockService() : new DemoRealApiService();
};

export { default as DemoRealApiService } from './service';
export { default as DemoMockService } from './mock';
export * from './interface';
