import { API_MODE, type ApiMode } from '@/shared/constants';
import type { ModelApiService, ModelOption } from '../types';
import { api } from '@/shared/api';
import type { ApiResponse } from '@/types/api';

export default class ModelRealApiService implements ModelApiService {
  getType(): ApiMode {
    return API_MODE.real;
  }

  async getModels(): Promise<ModelOption[]> {
    const response = await api.get<ApiResponse<ModelOption[]>>('/api/models');
    return response.data.data.map(this._mapModelOption);
  }

  async getDefaultModel(): Promise<ModelOption> {
    const response = await api.get<ApiResponse<ModelOption[]>>('/api/models');
    return this._mapModelOption(response.data.data.find((model) => model.default));
  }

  _mapModelOption(data: any): ModelOption {
    return {
      id: data.modelId,
      name: data.modelName,
      displayName: data.displayName,
      enabled: data.enabled,
      default: data.default,
      provider: data.provider,
    };
  }
}
