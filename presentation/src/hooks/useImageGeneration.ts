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
      artStyleModifiers,
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
      artStyleModifiers?: string;
    }) => {
      console.log('[ImageGen] Starting image generation for slide:', slideId);
      const result = await imageApi.generateImage(presentationId, slideId, {
        prompt,
        imageModel: model,
        themeStyle,
        themeDescription,
        artStyle,
        artStyleModifiers,
      });
      console.log('[ImageGen] Image generation completed for slide:', slideId, result);
      return result;
    },
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff: 1s, 2s, 4s
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['presentation', presentationId],
      });
    },
    onError: (error, variables) => {
      console.error('[ImageGen] Image generation failed for slide:', variables.slideId, error);
    },
  });
}
