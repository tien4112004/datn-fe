import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { getImageApi } from '@/services/image/api';

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
      themeStyle,
      themeDescription,
      artStyle,
      artDescription,
    }: {
      slideId: string;
      prompt: string;
      model: {
        name: string;
        provider: string;
      };
      themeStyle?: string;
      themeDescription?: string;
      artStyle?: string;
      artDescription?: string;
    }) => {
      const result = await imageApi.generateImage(presentationId, slideId, {
        prompt,
        model,
        themeStyle,
        themeDescription,
        artStyle,
        artDescription,
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
