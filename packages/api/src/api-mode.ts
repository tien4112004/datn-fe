/**
 * API Mode Management
 * @deprecated This entire module is deprecated. Services now use dependency injection with ApiClient.
 * Use `new YourService(apiClient, baseUrl)` instead of mock/real switching.
 * See fe/packages/api/src/service-factory.ts for new patterns.
 */

/**
 * @deprecated Use dependency injection with ApiClient instead. This constant is no longer needed.
 */
export const API_MODE = {
  mock: 'mock',
  real: 'real',
} as const;

/**
 * @deprecated Use dependency injection with ApiClient instead.
 */
export type ApiMode = keyof typeof API_MODE;

const LOCAL_STORAGE_KEY = 'apiMode';

/**
 * Get the current API mode from localStorage
 * Defaults to 'real' if not set or invalid value
 */
export function getApiMode(): ApiMode {
  if (typeof window === 'undefined') {
    return API_MODE.real;
  }
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  return stored === API_MODE.mock || stored === API_MODE.real ? (stored as ApiMode) : API_MODE.real;
}

/**
 * Set the API mode in localStorage
 */
export function setApiMode(mode: ApiMode): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, mode);
}

/**
 * Check if currently in mock mode
 */
export function isMockMode(): boolean {
  return getApiMode() === API_MODE.mock;
}

/**
 * @deprecated No longer needed - services use dependency injection with ApiClient
 */
export interface ApiService {
  baseUrl: string;
  getType(): ApiMode;
}

/**
 * Get an API service instance based on current mode
 * @deprecated Use dependency injection instead: `new YourService(apiClient, baseUrl)`
 * For creating ApiClient instances, use `getDefaultApiClient()` from service-factory.ts
 */
export function getApiServiceFactory<T extends ApiService>(
  MockServiceClass: new (baseUrl: string) => T,
  RealServiceClass: new (baseUrl: string) => T,
  baseUrl: string
): T {
  const apiMode = getApiMode();
  return apiMode === API_MODE.mock ? new MockServiceClass(baseUrl) : new RealServiceClass(baseUrl);
}
