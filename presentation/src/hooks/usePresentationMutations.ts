import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { getPresentationApi } from '@/services/presentation/api';
import type { Slide, Presentation } from '@/types/slides';

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
      const updatedPresentation = await presentationApi.upsertSlides(presentationId, slides);
      return updatedPresentation;
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

/**
 * Update full presentation (title, slides, theme, viewport, thumbnail)
 */
export function useUpdatePresentation(presentationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title?: string;
      slides?: Slide[];
      theme?: any;
      viewport?: any;
      thumbnail?: string;
    }) => {
      const updatedPresentation = await presentationApi.updatePresentation(presentationId, data);
      return updatedPresentation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['presentation', presentationId],
      });
    },
  });
}
