import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { getImageApi } from '@/services/imageApi';

/**
 * Generate an image for a slide element
 */
export function useGenerateImage(presentationId: string) {
  const queryClient = useQueryClient();
  const imageApi = getImageApi();

  return useMutation({
    mutationFn: async ({
      slideId,
      prompt,
      model,
    }: {
      slideId: string;
      prompt: string;
      model: {
        name: string;
        provider: string;
      };
    }) => {
      const result = await imageApi.generateImage(presentationId, slideId, {
        prompt,
        model,
      });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['presentation', presentationId],
      });
    },
  });
}
