/**
 * API Mode Management
 * Provides functionality to switch between Mock and Real API implementations
 * Used across the application for consistent API behavior control
 */

export const API_MODE = {
  mock: 'mock',
  real: 'real',
} as const;

export type ApiMode = keyof typeof API_MODE;

const LOCAL_STORAGE_KEY = 'apiMode';

/**
 * Get the current API mode from localStorage
 * Defaults to 'mock' if not set or invalid value
 */
export function getApiMode(): ApiMode {
  if (typeof window === 'undefined') {
    return API_MODE.mock;
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

export interface ApiService {
  baseUrl: string;
  getType(): ApiMode;
}

/**
 * Get an API service instance based on current mode
 * Used with traditional JavaScript (non-reactive)
 */
export function getApiServiceFactory<T extends ApiService>(
  MockServiceClass: new (baseUrl: string) => T,
  RealServiceClass: new (baseUrl: string) => T,
  baseUrl: string
): T {
  const apiMode = getApiMode();
  return apiMode === API_MODE.mock ? new MockServiceClass(baseUrl) : new RealServiceClass(baseUrl);
}
