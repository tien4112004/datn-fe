import type { ApiClient, ApiResponse } from '@aiprimary/api';
import type { ModelApiService, Model, ModelPatchData, ModelType } from '../types';

export default class ModelService implements ModelApiService {
  private readonly apiClient: ApiClient;
  private readonly baseUrl: string;

  constructor(apiClient: ApiClient, baseUrl: string) {
    this.apiClient = apiClient;
    this.baseUrl = baseUrl;
  }

  getType() {
    return 'real' as const;
  }

  async getModels(type: ModelType | null): Promise<Model[]> {
    const baseUrl = this.baseUrl;
    const response = await this.apiClient.get<ApiResponse<Model[]>>(`${baseUrl}/api/models`, {
      params: { modelType: type },
    });
    const models = response.data.data.map(this._mapModelOption);

    // Append Mock Image option for IMAGE type
    if (type === 'IMAGE' || type === null) {
      models.push({
        id: 'mock',
        name: 'mock',
        displayName: 'Mock Image',
        enabled: true,
        default: false,
        provider: 'LocalAI',
        type: 'IMAGE',
      });
    }

    return models;
  }

  async getDefaultModel(type: ModelType): Promise<Model> {
    const baseUrl = this.baseUrl;
    const response = await this.apiClient.get<ApiResponse<Model[]>>(`${baseUrl}/api/models`, {
      params: { modelType: type },
    });
    return this._mapModelOption(response.data.data.find((model) => model.default));
  }

  async patchModel(modelId: string, data: ModelPatchData): Promise<Model> {
    const baseUrl = this.baseUrl;
    const response = await this.apiClient.patch<ApiResponse<Model>>(`${baseUrl}/api/models/${modelId}`, data);
    return this._mapModelOption(response.data.data);
  }

  _mapModelOption(data: any): Model {
    return {
      id: data.modelId,
      name: data.modelName,
      displayName: data.displayName,
      enabled: data.enabled,
      default: data.default,
      provider: data.provider,
      type: data.modelType,
    };
  }
}
