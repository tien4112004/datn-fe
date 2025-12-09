import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { mockImageApi as imageApi } from '@/services/imageApi';

/**
 * Generate an image for a slide element
 */
export function useGenerateImage(presentationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      slideId,
      elementId,
      prompt,
      model,
    }: {
      slideId: string;
      elementId: string;
      prompt: string;
      model: {
        name: string;
        provider: string;
      };
    }) => {
      const result = await imageApi.generateImage(presentationId, slideId, elementId, {
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
