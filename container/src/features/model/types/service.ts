import type { Service } from '@/shared/api';
import type { ModelOption } from './model';

export interface ModelPatchData {
  default?: boolean;
  enabled?: boolean;
}

export interface ModelApiService extends Service {
  getModels(): Promise<ModelOption[]>;
  getDefaultModel(): Promise<ModelOption>;
  patchModel(modelId: string, data: ModelPatchData): Promise<ModelOption>;
}
