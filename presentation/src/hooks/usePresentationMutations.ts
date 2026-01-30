import {
  useUpsertSlides,
  useUpdatePresentation as useUpdatePresentationQuery,
  useSetParsed as useSetParsedQuery,
} from '@/services/presentation/queries';
import { getPresentationApi } from '@/services/presentation/api';
import { useMutation } from '@tanstack/vue-query';
import type { Slide } from '@/types/slides';

const presentationApi = getPresentationApi();

/**
 * Fetch AI result for a presentation (used for parsing unparsed presentations)
 * Note: This is kept as a custom mutation since getAiResultById is not a standard CRUD operation
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
 * @deprecated Use useUpsertSlides from @/services/presentation/queries instead
 */
export function useUpdateSlides(presentationId: string) {
  const mutation = useUpsertSlides();

  return {
    ...mutation,
    mutate: (slides: Slide[], options?: any) => {
      mutation.mutate({ presentationId, slides }, options);
    },
    mutateAsync: (slides: Slide[]) => {
      return mutation.mutateAsync({ presentationId, slides });
    },
  };
}

/**
 * Mark presentation as parsed (generation complete)
 * @deprecated Use useSetParsed from @/services/presentation/queries instead
 */
export function useSetParsed(presentationId: string) {
  const mutation = useSetParsedQuery();

  return {
    ...mutation,
    mutate: (options?: any) => {
      mutation.mutate(presentationId, options);
    },
    mutateAsync: () => {
      return mutation.mutateAsync(presentationId);
    },
  };
}

/**
 * Update full presentation (title, slides, theme, viewport, thumbnail)
 * @deprecated Use useUpdatePresentation from @/services/presentation/queries instead
 */
export function useUpdatePresentation(presentationId: string) {
  const mutation = useUpdatePresentationQuery();

  return {
    ...mutation,
    mutate: (
      data: {
        title?: string;
        slides?: Slide[];
        theme?: any;
        viewport?: any;
        thumbnail?: string;
      },
      options?: any
    ) => {
      mutation.mutate({ presentationId, data }, options);
    },
    mutateAsync: (data: {
      title?: string;
      slides?: Slide[];
      theme?: any;
      viewport?: any;
      thumbnail?: string;
    }) => {
      return mutation.mutateAsync({ presentationId, data });
    },
  };
}
