import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useModelApiService } from '../api';
import type { ModelPatchData, ModelType } from '../types';

export const useModels = (type: ModelType | null) => {
  const modelApiService = useModelApiService();

  const { data: models, ...query } = useQuery({
    queryKey: [modelApiService.getType(), 'models', type],
    queryFn: async () => {
      const data = await modelApiService.getModels(type);
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    models: models || [],
    defaultModel: models?.find((model) => model.default) || models?.[0],
    ...query,
  };
};

export const usePatchModel = () => {
  const queryClient = useQueryClient();
  const modelApiService = useModelApiService();

  return useMutation({
    mutationFn: async ({ modelId, data }: { modelId: string; data: ModelPatchData }) => {
      return await modelApiService.patchModel(modelId, data);
    },
    onSuccess: () => {
      // Invalidate and refetch models query
      queryClient.invalidateQueries({
        queryKey: [modelApiService.getType(), 'models', null],
      });
    },
  });
};
