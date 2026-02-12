/**
 * Theme API factory
 * Provides access to theme services
 */

import { type ApiClient, getBackendUrl, getDefaultApiClient } from '@aiprimary/api';
import { ThemeService } from './service';
import type { ThemeDescriptionRequest, ThemeDescriptionResponse } from './types';
import type { IThemeApi } from './service';

// Re-export types and interfaces
export type { ThemeDescriptionRequest, ThemeDescriptionResponse, IThemeApi };

/**
 * Get a theme API service instance
 * Automatically detects WebView context and uses appropriate auth method
 *
 * @param apiClient Optional API client instance. Uses default if not provided.
 * @returns Theme API service instance
 *
 * @example
 * ```ts
 * const themeApi = getThemeApi();
 * const description = await themeApi.generateThemeDescription({
 *   primaryColor: '#1e40af',
 *   backgroundColor: '#ffffff',
 *   textColor: '#000000'
 * });
 * ```
 */
export const getThemeApi = (apiClient: ApiClient = getDefaultApiClient()): IThemeApi => {
  return new ThemeService(apiClient, getBackendUrl());
};
