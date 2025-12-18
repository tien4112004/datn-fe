import type { AuthApiService } from '@/types/service';
import AuthMockService from './mock';
import AuthRealApiService from './service';
import { getApiServiceFactory, getBackendUrl } from '../base-service';

/**
 * Get auth API service instance (for use in React components)
 * Automatically switches between mock and real based on localStorage setting
 */
export const getAuthApiService = (): AuthApiService => {
  const backendUrl = getBackendUrl();

  return getApiServiceFactory<AuthApiService>(AuthMockService, AuthRealApiService, backendUrl);
};

// Export services for convenience
export { AuthMockService, AuthRealApiService };
