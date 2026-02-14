/**
 * Model API factory
 * Provides access to model services
 */

import { type ApiClient, getBackendUrl, getDefaultApiClient } from '@aiprimary/api';
import { ModelService } from './service';
import type { ModelInfo, ModelType } from './types';
import type { IModelApi } from './service';

// Re-export types and interfaces
export type { ModelInfo, ModelType, IModelApi };

// Re-export queries
export { useModels, useDefaultModel } from './queries';

/**
 * Get a model API service instance
 * Automatically detects WebView context and uses appropriate auth method
 *
 * @param apiClient Optional API client instance. Uses default if not provided.
 * @returns Model API service instance
 *
 * @example
 * ```ts
 * const modelApi = getModelApi();
 * const textModels = await modelApi.fetchModels('TEXT');
 * const defaultModel = await modelApi.fetchDefaultModel('TEXT');
 * ```
 */
export const getModelApi = (apiClient: ApiClient = getDefaultApiClient()): IModelApi => {
  return new ModelService(apiClient, getBackendUrl());
};
