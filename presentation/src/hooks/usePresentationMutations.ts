import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { getPresentationApi, type Slide, type Presentation } from '@/services/presentationApi';

const presentationApi = getPresentationApi();

/**
 * Fetch AI result for a presentation (used for parsing unparsed presentations)
 */
export function useAiResultById(presentationId: string) {
  return useMutation({
    mutationFn: async () => {
      const aiResult = await presentationApi.getAiResultById(presentationId);
      return aiResult;
    },
  });
}

/**
 * Update presentation slides (batch upsert)
 */
export function useUpdateSlides(presentationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slides: Slide[]) => {
      let updatedPresentation: Presentation;

      for (const slide of slides) {
        updatedPresentation = await presentationApi.upsertSlide(presentationId, slide);
      }

      return updatedPresentation!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['presentation', presentationId],
      });
    },
  });
}

/**
 * Mark presentation as parsed (generation complete)
 */
export function useSetParsed(presentationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const updatedPresentation = await presentationApi.setParsed(presentationId);
      return updatedPresentation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['presentation', presentationId],
      });
    },
  });
}
