import type { AdminApiService } from '@/types/service';
import AdminRealApiService from './service';
import { getBackendUrl } from '@aiprimary/api';

/**
 * Get admin API service instance
 * Returns the real API service implementation
 */
export const getAdminApiService = (): AdminApiService => {
  const backendUrl = getBackendUrl();
  return new AdminRealApiService(backendUrl);
};

export { AdminRealApiService };
