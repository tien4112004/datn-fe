import { API_MODE, type ApiMode } from '@aiprimary/api';
import type { Service } from '@/types/service';

/**
 * Get API mode from localStorage or environment
 */
const getAdminApiMode = (): ApiMode => {
  const stored = localStorage.getItem('admin_api_mode');
  if (stored === 'mock' || stored === 'real') {
    return stored;
  }
  return (import.meta.env.VITE_API_MODE as ApiMode) || 'mock';
};

/**
 * Factory function to create API service instances
 * Uses localStorage to determine which service to instantiate
 */
export function getApiServiceFactory<T extends Service>(
  MockService: new (baseUrl: string) => T,
  RealService: new (baseUrl: string) => T,
  baseUrl: string
): T {
  const apiMode = getAdminApiMode();
  return apiMode === API_MODE.mock ? new MockService(baseUrl) : new RealService(baseUrl);
}

/**
 * Get backend URL from environment
 */
export function getBackendUrl(): string {
  return import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
}
