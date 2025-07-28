import { useApiSwitching } from '@/context/api-switching';

export interface Service {
  getType(): 'mock' | 'real';
}

export function createApiServiceFactory<T extends Service>(
  MockService: new () => T,
  RealService: new () => T
) {
  const { apiMode } = useApiSwitching();
  return apiMode === 'mock' ? new MockService() : new RealService();
}
