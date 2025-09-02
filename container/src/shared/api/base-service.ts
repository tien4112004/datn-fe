import { getApiMode, useApiSwitching } from '@/context/api-switching';
import { API_MODE, type ApiMode } from '@/shared/constants';

export interface Service {
  baseUrl: string;
  getType(): ApiMode;
}

export function createApiServiceFactory<T extends Service>(
  MockService: new (baseUrl: string) => T,
  RealService: new (baseUrl: string) => T,
  baseUrl: string
) {
  const { apiMode } = useApiSwitching();
  return apiMode === API_MODE.mock ? new MockService(baseUrl) : new RealService(baseUrl);
}

export function getApiServiceFactory<T extends Service>(
  MockService: new (baseUrl: string) => T,
  RealService: new (baseUrl: string) => T,
  baseUrl: string
): T {
  const apiMode = getApiMode();
  return apiMode === API_MODE.mock ? new MockService(baseUrl) : new RealService(baseUrl);
}
