/**
 * Model service
 * Handles API calls for AI model configuration and retrieval
 */

import type { ApiClient, ApiResponse } from '@aiprimary/api';
import type { ModelInfo, ModelListParams, ModelListResponse } from './types';

export interface IModelApi {
  /**
   * Fetch available models by type
   *
   * @param modelType Type of models to fetch (TEXT or IMAGE)
   * @returns List of available models
   */
  fetchModels(modelType: ModelListParams['modelType']): Promise<ModelInfo[]>;

  /**
   * Fetch default model by type
   *
   * @param modelType Type of model to fetch default for (TEXT or IMAGE)
   * @returns Default model or null if not found
   */
  fetchDefaultModel(modelType: ModelListParams['modelType']): Promise<ModelInfo | null>;
}

/**
 * Model service implementation
 * Handles API calls for model configuration
 */
export class ModelService implements IModelApi {
  constructor(
    private apiClient: ApiClient,
    private backendUrl: string
  ) {}

  /**
   * Fetch available models by type
   *
   * @param modelType Type of models to fetch
   * @returns List of available enabled models
   * @throws Error if API call fails
   *
   * @example
   * ```ts
   * const modelApi = getModelApi();
   * const imageModels = await modelApi.fetchModels('IMAGE');
   * ```
   */
  async fetchModels(modelType: ModelListParams['modelType']): Promise<ModelInfo[]> {
    try {
      const response = await this.apiClient.get<ApiResponse<ModelListResponse>>(
        `${this.backendUrl}/api/models`,
        {
          params: { modelType },
        }
      );

      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data
          .filter((m) => m.enabled)
          .map((m) => ({
            name: m.modelName,
            provider: (m.provider || 'openai').toLowerCase(),
            displayName: m.displayName || m.modelName,
          }));
      }

      console.warn('[ModelService] Invalid response format:', response.data);
      return [];
    } catch (error) {
      console.error('[ModelService] Failed to fetch models:', error);
      throw error;
    }
  }

  /**
   * Fetch default model by type
   *
   * @param modelType Type of model to fetch default for
   * @returns Default model or null if not found
   * @throws Error if API call fails
   *
   * @example
   * ```ts
   * const modelApi = getModelApi();
   * const defaultTextModel = await modelApi.fetchDefaultModel('TEXT');
   * ```
   */
  async fetchDefaultModel(modelType: ModelListParams['modelType']): Promise<ModelInfo | null> {
    try {
      const response = await this.apiClient.get<ApiResponse<ModelListResponse>>(
        `${this.backendUrl}/api/models`,
        {
          params: { modelType },
        }
      );

      if (response.data?.data && Array.isArray(response.data.data)) {
        const defaultModel = response.data.data.find((m) => m.default && m.enabled);

        if (defaultModel) {
          return {
            name: defaultModel.modelName,
            provider: (defaultModel.provider || 'openai').toLowerCase(),
            displayName: defaultModel.displayName || defaultModel.modelName,
          };
        }
      }

      console.warn('[ModelService] No default model found for type:', modelType);
      return null;
    } catch (error) {
      console.error('[ModelService] Failed to fetch default model:', error);
      throw error;
    }
  }
}
