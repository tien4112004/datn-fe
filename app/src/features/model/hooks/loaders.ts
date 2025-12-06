import { getModelApiService } from '../api';
import type { ModelType } from '../types';

/**
 * @deprecated Use useDefaultModel hook instead
 */
export const getDefaultModel = async (type: ModelType) => {
  const modelApiService = getModelApiService();
  return await modelApiService.getDefaultModel(type);
};

/**
 * @deprecated Use useModels hook instead
 */
export const getModels = async (type: ModelType | null) => {
  const modelApiService = getModelApiService();
  const models = await modelApiService.getModels(type);
  const defaultModel = models.find((model) => model.default) || models[0];

  return [models, defaultModel];
};
