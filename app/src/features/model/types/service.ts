import type { Model, ModelType } from './model';

export interface ModelPatchData {
  default?: boolean;
  enabled?: boolean;
}

export interface ModelApiService {
  getType(): 'real' | 'mock';
  getModels(type: ModelType | null): Promise<Model[]>;
  getDefaultModel(type: ModelType): Promise<Model>;
  patchModel(modelId: string, data: ModelPatchData): Promise<Model>;
}
