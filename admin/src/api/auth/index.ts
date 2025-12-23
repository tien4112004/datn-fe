import type { AuthApiService } from '@/types/service';
import AuthRealApiService from './service';
import { getBackendUrl } from '@aiprimary/api';

/**
 * Get auth API service instance
 * Returns the real API service implementation
 */
export const getAuthApiService = (): AuthApiService => {
  const backendUrl = getBackendUrl();
  return new AuthRealApiService(backendUrl);
};

export { AuthRealApiService };
