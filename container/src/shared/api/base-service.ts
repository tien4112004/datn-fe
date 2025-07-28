import { useApiSwitching } from '@/context/api-switching';
import type { ApiMode } from '@/shared/constants';

export interface Service {
  getType(): ApiMode;
}

export function createApiServiceFactory<T extends Service>(
  MockService: new () => T,
  RealService: new () => T
) {
  const { apiMode } = useApiSwitching();
  return apiMode === 'mock' ? new MockService() : new RealService();
}
