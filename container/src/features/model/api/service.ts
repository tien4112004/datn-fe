import { API_MODE, type ApiMode } from '@/shared/constants';
import type { ModelApiService, Model, ModelPatchData, ModelType } from '../types';
import { api } from '@/shared/api';
import type { ApiResponse } from '@/types/api';

export default class ModelRealApiService implements ModelApiService {
  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  getType(): ApiMode {
    return API_MODE.real;
  }

  async getModels(type: ModelType | null): Promise<Model[]> {
    const baseUrl = this.baseUrl;
    const response = await api.get<ApiResponse<Model[]>>(`${baseUrl}/api/models`, {
      params: { modelType: type },
    });
    return response.data.data.map(this._mapModelOption);
  }

  async getDefaultModel(type: ModelType): Promise<Model> {
    const baseUrl = this.baseUrl;
    const response = await api.get<ApiResponse<Model[]>>(`${baseUrl}/api/models`, {
      params: { modelType: type },
    });
    return this._mapModelOption(response.data.data.find((model) => model.default));
  }

  async patchModel(modelId: string, data: ModelPatchData): Promise<Model> {
    const baseUrl = this.baseUrl;
    const response = await api.patch<ApiResponse<Model>>(`${baseUrl}/api/models/${modelId}`, data);
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
      type: data.type,
    };
  }
}
