import type { AdminApiService } from '@/types/service';
import AdminMockService from './mock';
import AdminRealApiService from './service';
import { getApiServiceFactory, getBackendUrl } from '../base-service';

/**
 * Get admin API service instance (for use in React components)
 * Automatically switches between mock and real based on localStorage setting
 */
export const getAdminApiService = (): AdminApiService => {
  const backendUrl = getBackendUrl();

  return getApiServiceFactory<AdminApiService>(AdminMockService, AdminRealApiService, backendUrl);
};

// Export service for convenience
export { AdminMockService, AdminRealApiService };
