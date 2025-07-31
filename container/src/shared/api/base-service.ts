import { getApiMode, useApiSwitching } from '@/context/api-switching';
import { API_MODE, type ApiMode } from '@/shared/constants';

export interface Service {
  getType(): ApiMode;
}

export function createApiServiceFactory<T extends Service>(
  MockService: new () => T,
  RealService: new () => T
) {
  const { apiMode } = useApiSwitching();
  return apiMode === API_MODE.mock ? new MockService() : new RealService();
}

export function getApiServiceFactory<T extends Service>(
  MockService: new () => T,
  RealService: new () => T
): T {
  const apiMode = getApiMode();
  return apiMode === API_MODE.mock ? new MockService() : new RealService();
}
