import { useQueryClient } from '@tanstack/vue-query';
import { useGenerateImage as useGenerateImageQuery } from '@/services/image/queries';
import { queryKeys } from '@/services/query-keys';

/**
 * Generate an image for a slide element
 * @deprecated This hook is a wrapper that adds presentation cache invalidation.
 * Consider using the base useGenerateImage from queries directly.
 */
export function useGenerateImage(presentationId: string) {
  const queryClient = useQueryClient();
  const generateImageMutation = useGenerateImageQuery();

  return {
    ...generateImageMutation,
    mutate: (variables: {
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
      console.log('[ImageGen] Starting image generation for slide:', variables.slideId);
      generateImageMutation.mutate(
        {
          presentationId,
          slideId: variables.slideId,
          params: {
            prompt: variables.prompt,
            imageModel: variables.model,
            themeStyle: variables.themeStyle,
            themeDescription: variables.themeDescription,
            artStyle: variables.artStyle,
            artStyleModifiers: variables.artStyleModifiers,
          },
        },
        {
          onSuccess: (result) => {
            console.log('[ImageGen] Image generation completed for slide:', variables.slideId, result);
            // Invalidate presentation query to refetch with new image
            queryClient.invalidateQueries({
              queryKey: queryKeys.presentations.detail(presentationId),
            });
          },
          onError: (error) => {
            console.error('[ImageGen] Image generation failed for slide:', variables.slideId, error);
          },
        }
      );
    },
    mutateAsync: async (variables: {
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
      console.log('[ImageGen] Starting async image generation for slide:', variables.slideId);
      const result = await generateImageMutation.mutateAsync({
        presentationId,
        slideId: variables.slideId,
        params: {
          prompt: variables.prompt,
          imageModel: variables.model,
          themeStyle: variables.themeStyle,
          themeDescription: variables.themeDescription,
          artStyle: variables.artStyle,
          artStyleModifiers: variables.artStyleModifiers,
        },
      });
      console.log('[ImageGen] Image generation completed for slide:', variables.slideId, result);
      // Invalidate presentation query to refetch with new image
      queryClient.invalidateQueries({
        queryKey: queryKeys.presentations.detail(presentationId),
      });
      return result;
    },
  };
}
