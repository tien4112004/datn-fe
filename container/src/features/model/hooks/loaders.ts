import { useModelApiService } from '../api';

export const getDefaultModel = async () => {
  const modelApiService = useModelApiService(true);
  return await modelApiService.getDefaultModel();
};

export const getModels = async () => {
  const modelApiService = useModelApiService(true);
  const models = await modelApiService.getModels();
  const defaultModel = models.find((model) => model.default) || models[0];

  return [models, defaultModel];
};
