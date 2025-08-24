import { useQuery } from '@tanstack/react-query';
import { useModelApiService } from '../api';

export const useModels = () => {
  const modelApiService = useModelApiService(false);

  const { data: models, ...query } = useQuery({
    queryKey: [modelApiService.getType(), 'models'],
    queryFn: async () => {
      const data = await modelApiService.getModels();
      console.log('Fetch models', data);
      return data;
    },
  });

  return {
    models,
    ...query,
  };
};
