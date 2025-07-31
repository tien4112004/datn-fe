import { useModelApiService } from '../api';

export const getDefaultModel = async () => {
  const modelApiService = useModelApiService(true);
  return await modelApiService.getDefaultModel();
};
