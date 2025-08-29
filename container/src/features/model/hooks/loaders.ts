import { useModelApiService } from '../api';

/**
 * @deprecated Use hooks instead
 */
export const getDefaultModel = async () => {
  const modelApiService = useModelApiService(true);
  return await modelApiService.getDefaultModel();
};

/**
 * @deprecated Use hooks instead
 */
export const getModels = async () => {
  const modelApiService = useModelApiService(true);
  const models = await modelApiService.getModels();
  const defaultModel = models.find((model) => model.default) || models[0];

  return [models, defaultModel];
};
