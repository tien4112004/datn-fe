import { getModelApiService } from '../api';

export const getDefaultModel = async () => {
  const modelApiService = getModelApiService();
  return await modelApiService.getDefaultModel();
};

export const getModels = async () => {
  const modelApiService = getModelApiService();
  const models = await modelApiService.getModels();
  const defaultModel = models.find((model) => model.default) || models[0];

  return [models, defaultModel];
};
