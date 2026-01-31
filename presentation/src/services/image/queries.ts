import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseQueryReturnType,
  type UseMutationOptions,
  type UseMutationReturnType,
} from '@tanstack/vue-query';
import { getImageApi } from './api';
import { queryKeys } from '../query-keys';
import type { ImageGenerationParams, SingleImageResponse, ImageSearchPayload } from './types';
import type { MaybeRef } from 'vue';
import { unref, computed } from 'vue';

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Hook to fetch user's generated images with pagination
 * Sorting is always by createdAt field (handled by backend)
 *
 * @example
 * ```ts
 * const page = ref(1);
 * const { data, isLoading, error } = useMyImages(page, 20, 'desc');
 * ```
 */
export function useMyImages(
  page?: MaybeRef<number>,
  pageSize?: MaybeRef<number>,
  sort?: MaybeRef<'asc' | 'desc'>,
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
): UseQueryReturnType<any, Error> {
  const imageApi = getImageApi();

  return useQuery({
    queryKey: computed(() => queryKeys.images.my(unref(page), unref(pageSize), unref(sort))),
    queryFn: () => imageApi.getMyImages(unref(page), unref(pageSize), unref(sort)),
    staleTime: 1000 * 60, // 1 minute
    ...options,
  });
}

/**
 * Hook to search for images
 *
 * @example
 * ```ts
 * const searchParams = ref({ query: 'nature', orientation: 'landscape', page: 1 });
 * const { data: searchResults, isLoading } = useImageSearch(searchParams);
 * ```
 */
export function useImageSearch(
  payload: MaybeRef<ImageSearchPayload>,
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
): UseQueryReturnType<any, Error> {
  const imageApi = getImageApi();

  return useQuery({
    queryKey: computed(() => queryKeys.images.search(unref(payload))),
    queryFn: () => imageApi.searchImage(unref(payload)),
    enabled: () => !!unref(payload)?.query && unref(payload).query.length > 0,
    staleTime: 1000 * 60 * 5, // Search results are cached for 5 minutes
    ...options,
  });
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

interface GenerateImageVariables {
  presentationId: string;
  slideId: string;
  params: ImageGenerationParams;
}

/**
 * Hook to generate an image for a slide
 *
 * @example
 * ```ts
 * const generateImageMutation = useGenerateImage();
 *
 * generateImageMutation.mutate({
 *   presentationId: '123',
 *   slideId: 'slide-1',
 *   params: {
 *     prompt: 'A beautiful sunset',
 *     imageModel: { name: 'dall-e-3', provider: 'openai' },
 *     themeStyle: 'modern',
 *     artStyle: 'photorealistic'
 *   }
 * });
 * ```
 */
export function useGenerateImage(
  options?: UseMutationOptions<SingleImageResponse, Error, GenerateImageVariables>
): UseMutationReturnType<SingleImageResponse, Error, GenerateImageVariables, unknown> {
  const queryClient = useQueryClient();
  const imageApi = getImageApi();

  return useMutation({
    mutationFn: ({ presentationId, slideId, params }: GenerateImageVariables) =>
      imageApi.generateImage(presentationId, slideId, params),
    onSuccess: () => {
      // Invalidate my images list after successful generation
      queryClient.invalidateQueries({ queryKey: queryKeys.images.all });
    },
    ...options,
  });
}

/**
 * Hook to search images (as a mutation for more control over when it fires)
 * Alternative to useImageSearch when you want manual trigger control
 *
 * @example
 * ```ts
 * const searchMutation = useImageSearchMutation();
 * searchMutation.mutate({ query: 'mountains', orientation: 'landscape' });
 * ```
 */
export function useImageSearchMutation(
  options?: UseMutationOptions<any, Error, ImageSearchPayload>
): UseMutationReturnType<any, Error, ImageSearchPayload, unknown> {
  const imageApi = getImageApi();

  return useMutation({
    mutationFn: (payload: ImageSearchPayload) => imageApi.searchImage(payload),
    ...options,
  });
}
