import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useModelApiService } from '../api';
import type { ModelPatchData } from '../types';

export const useModels = () => {
  const modelApiService = useModelApiService();

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
    defaultModel: models?.find((model) => model.default) || models?.[0],
    ...query,
  };
};

export const usePatchModel = () => {
  const queryClient = useQueryClient();
  const modelApiService = useModelApiService(false);

  return useMutation({
    mutationFn: async ({ modelId, data }: { modelId: string; data: ModelPatchData }) => {
      return modelApiService.patchModel(modelId, data);
    },
    onSuccess: () => {
      // Invalidate and refetch models query
      queryClient.invalidateQueries({
        queryKey: [modelApiService.getType(), 'models'],
      });
    },
    onError: (error) => {
      console.error('Failed to patch model:', error);
    },
  });
};
