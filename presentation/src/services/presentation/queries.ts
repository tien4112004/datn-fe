import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseQueryReturnType,
  type UseMutationOptions,
  type UseMutationReturnType,
} from '@tanstack/vue-query';
import { getPresentationApi, getPresentationWebViewApi } from './api';
import { queryKeys } from '../query-keys';
import type { Presentation, SlideTheme, SlideLayoutSchema, Slide } from '@aiprimary/core';
import type {
  PresentationGenerationRequest,
  PresentationGenerationStartResponse,
  SharedUserApiResponse,
  SearchUserApiResponse,
  SharePresentationRequest,
  PublicAccessRequest,
  PublicAccessResponse,
  ShareStateResponse,
} from './types';
import type { ImageGenerationParams } from '../image/types';
import type { MaybeRef } from 'vue';
import { unref } from 'vue';

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Hook to fetch a presentation by ID
 *
 * @param presentationId - The ID of the presentation (reactive or static)
 * @example
 * ```ts
 * const presentationId = ref('123');
 * const { data: presentation, isLoading, error } = usePresentation(presentationId);
 * ```
 */
export function usePresentation(
  presentationId: MaybeRef<string>,
  options?: Omit<UseQueryOptions<Presentation, Error>, 'queryKey' | 'queryFn'>
): UseQueryReturnType<Presentation, Error> {
  const presentationApi = getPresentationApi();

  return useQuery({
    queryKey: queryKeys.presentations.detail(unref(presentationId)),
    queryFn: () => presentationApi.getPresentation(unref(presentationId)),
    enabled: () => !!unref(presentationId),
    staleTime: 1000 * 30, // 30 seconds
    ...options,
  });
}

/**
 * Hook to fetch AI result for a presentation
 * Used during parsing phase to retrieve generated slide layouts
 *
 * @param presentationId - The ID of the presentation
 * @example
 * ```ts
 * const { data, isLoading } = useAiResult('presentation-123');
 * // data: { slides: SlideLayoutSchema[], generationOptions?: ImageGenerationParams }
 * ```
 */
export function useAiResult(
  presentationId: MaybeRef<string>,
  options?: Omit<
    UseQueryOptions<
      {
        slides: SlideLayoutSchema[];
        generationOptions?: Omit<ImageGenerationParams, 'prompt' | 'slideId'>;
      },
      Error
    >,
    'queryKey' | 'queryFn'
  >
): UseQueryReturnType<
  {
    slides: SlideLayoutSchema[];
    generationOptions?: Omit<ImageGenerationParams, 'prompt' | 'slideId'>;
  },
  Error
> {
  const presentationApi = getPresentationApi();

  return useQuery({
    queryKey: queryKeys.presentations.aiResult(unref(presentationId)),
    queryFn: () => presentationApi.getAiResultById(unref(presentationId)),
    enabled: () => !!unref(presentationId),
    staleTime: Infinity, // AI results don't change once generated
    ...options,
  });
}

/**
 * Hook to fetch slide themes with pagination
 *
 * @example
 * ```ts
 * const params = ref({ page: 1, limit: 20 });
 * const { data, isLoading } = useSlideThemes(params);
 * ```
 */
export function useSlideThemes(
  params?: MaybeRef<{ page?: number; limit?: number }>,
  options?: Omit<
    UseQueryOptions<
      {
        data: SlideTheme[];
        total: number;
        page: number;
        limit: number;
        hasMore: boolean;
      },
      Error
    >,
    'queryKey' | 'queryFn'
  >
): UseQueryReturnType<
  {
    data: SlideTheme[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  },
  Error
> {
  const presentationApi = getPresentationApi();

  return useQuery({
    queryKey: queryKeys.slideThemes.list(unref(params)),
    queryFn: () => presentationApi.getSlideThemes(unref(params)),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
}

/**
 * Hook to fetch shared users for a presentation
 *
 * @example
 * ```ts
 * const { data: sharedUsers, isLoading } = useSharedUsers('presentation-123');
 * ```
 */
export function useSharedUsers(
  presentationId: MaybeRef<string>,
  options?: Omit<UseQueryOptions<SharedUserApiResponse[], Error>, 'queryKey' | 'queryFn'>
): UseQueryReturnType<SharedUserApiResponse[], Error> {
  const presentationApi = getPresentationApi();

  return useQuery({
    queryKey: queryKeys.presentations.sharedUsers(unref(presentationId)),
    queryFn: () => presentationApi.getSharedUsers(unref(presentationId)),
    enabled: () => !!unref(presentationId),
    ...options,
  });
}

/**
 * Hook to fetch public access status for a presentation
 *
 * @example
 * ```ts
 * const { data: publicAccess, isLoading } = usePublicAccessStatus('presentation-123');
 * ```
 */
export function usePublicAccessStatus(
  presentationId: MaybeRef<string>,
  options?: Omit<UseQueryOptions<PublicAccessResponse, Error>, 'queryKey' | 'queryFn'>
): UseQueryReturnType<PublicAccessResponse, Error> {
  const presentationApi = getPresentationApi();

  return useQuery({
    queryKey: queryKeys.presentations.publicAccess(unref(presentationId)),
    queryFn: () => presentationApi.getPublicAccessStatus(unref(presentationId)),
    enabled: () => !!unref(presentationId),
    ...options,
  });
}

/**
 * Hook to fetch complete share state (shared users, public access, current user permission)
 * Optimized single-request alternative to separate useSharedUsers and usePublicAccessStatus
 *
 * @example
 * ```ts
 * const { data: shareState, isLoading } = useShareState('presentation-123');
 * // data: { sharedUsers, publicAccess, currentUserPermission }
 * ```
 */
export function useShareState(
  presentationId: MaybeRef<string>,
  options?: Omit<UseQueryOptions<ShareStateResponse, Error>, 'queryKey' | 'queryFn'>
): UseQueryReturnType<ShareStateResponse, Error> {
  const presentationApi = getPresentationApi();

  return useQuery({
    queryKey: queryKeys.presentations.shareState(unref(presentationId)),
    queryFn: () => presentationApi.getShareState(unref(presentationId)),
    enabled: () => !!unref(presentationId),
    ...options,
  });
}

/**
 * Hook to search users for sharing
 *
 * @example
 * ```ts
 * const searchQuery = ref('john');
 * const { data: users, isLoading } = useSearchUsers(searchQuery, { enabled: computed(() => searchQuery.value.length > 2) });
 * ```
 */
export function useSearchUsers(
  query: MaybeRef<string>,
  options?: Omit<UseQueryOptions<SearchUserApiResponse[], Error>, 'queryKey' | 'queryFn'>
): UseQueryReturnType<SearchUserApiResponse[], Error> {
  const presentationApi = getPresentationApi();

  return useQuery({
    queryKey: queryKeys.users.search(unref(query)),
    queryFn: () => presentationApi.searchUsers(unref(query)),
    enabled: () => !!unref(query) && unref(query).length > 0,
    staleTime: 1000 * 30, // 30 seconds
    ...options,
  });
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

interface UpsertSlideVariables {
  presentationId: string;
  slide: Slide;
}

/**
 * Hook to upsert a single slide
 *
 * @example
 * ```ts
 * const mutation = useUpsertSlide();
 * mutation.mutate({ presentationId: '123', slide: {...} });
 * ```
 */
export function useUpsertSlide(
  options?: UseMutationOptions<Presentation, Error, UpsertSlideVariables>
): UseMutationReturnType<Presentation, Error, UpsertSlideVariables, unknown> {
  const queryClient = useQueryClient();
  const presentationApi = getPresentationApi();

  return useMutation({
    mutationFn: ({ presentationId, slide }: UpsertSlideVariables) =>
      presentationApi.upsertSlide(presentationId, slide),
    onSuccess: (data, variables) => {
      // Invalidate and refetch presentation
      queryClient.invalidateQueries({ queryKey: queryKeys.presentations.detail(variables.presentationId) });
    },
    ...options,
  });
}

interface UpsertSlidesVariables {
  presentationId: string;
  slides: Slide[];
}

/**
 * Hook to upsert multiple slides
 *
 * @example
 * ```ts
 * const mutation = useUpsertSlides();
 * mutation.mutate({ presentationId: '123', slides: [...] });
 * ```
 */
export function useUpsertSlides(
  options?: UseMutationOptions<Presentation, Error, UpsertSlidesVariables>
): UseMutationReturnType<Presentation, Error, UpsertSlidesVariables, unknown> {
  const queryClient = useQueryClient();
  const presentationApi = getPresentationApi();

  return useMutation({
    mutationFn: ({ presentationId, slides }: UpsertSlidesVariables) =>
      presentationApi.upsertSlides(presentationId, slides),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.presentations.detail(variables.presentationId) });
    },
    ...options,
  });
}

/**
 * Hook to mark presentation as parsed
 *
 * @example
 * ```ts
 * const mutation = useSetParsed();
 * mutation.mutate('presentation-123');
 * ```
 */
export function useSetParsed(
  options?: UseMutationOptions<Presentation, Error, string>
): UseMutationReturnType<Presentation, Error, string, unknown> {
  const queryClient = useQueryClient();
  const presentationApi = getPresentationApi();

  return useMutation({
    mutationFn: (presentationId: string) => presentationApi.setParsed(presentationId),
    onSuccess: (data, presentationId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.presentations.detail(presentationId) });
    },
    ...options,
  });
}

interface UpdatePresentationVariables {
  presentationId: string;
  data: Partial<Presentation> | FormData;
}

/**
 * Hook to update presentation metadata
 *
 * @example
 * ```ts
 * const mutation = useUpdatePresentation();
 * mutation.mutate({ presentationId: '123', data: { title: 'New Title' } });
 * ```
 */
export function useUpdatePresentation(
  options?: UseMutationOptions<Presentation, Error, UpdatePresentationVariables>
): UseMutationReturnType<Presentation, Error, UpdatePresentationVariables, unknown> {
  const queryClient = useQueryClient();
  const presentationApi = getPresentationApi();

  return useMutation({
    mutationFn: ({ presentationId, data }: UpdatePresentationVariables) =>
      presentationApi.updatePresentation(presentationId, data),
    onSuccess: (data, variables) => {
      // Update cache with new data
      queryClient.setQueryData(queryKeys.presentations.detail(variables.presentationId), data);
    },
    ...options,
  });
}

interface SharePresentationVariables {
  presentationId: string;
  request: SharePresentationRequest;
}

/**
 * Hook to share a presentation with users
 *
 * @example
 * ```ts
 * const mutation = useSharePresentation();
 * mutation.mutate({
 *   presentationId: '123',
 *   request: { targetUserIds: ['user1'], permission: 'read' }
 * });
 * ```
 */
export function useSharePresentation(
  options?: UseMutationOptions<void, Error, SharePresentationVariables>
): UseMutationReturnType<void, Error, SharePresentationVariables, unknown> {
  const queryClient = useQueryClient();
  const presentationApi = getPresentationApi();

  return useMutation({
    mutationFn: ({ presentationId, request }: SharePresentationVariables) =>
      presentationApi.sharePresentation(presentationId, request),
    onSuccess: (data, variables) => {
      // Invalidate shared users and share state queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.presentations.sharedUsers(variables.presentationId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.presentations.shareState(variables.presentationId),
      });
    },
    ...options,
  });
}

interface RevokeAccessVariables {
  presentationId: string;
  userId: string;
}

/**
 * Hook to revoke user access to a presentation
 *
 * @example
 * ```ts
 * const mutation = useRevokeAccess();
 * mutation.mutate({ presentationId: '123', userId: 'user1' });
 * ```
 */
export function useRevokeAccess(
  options?: UseMutationOptions<void, Error, RevokeAccessVariables>
): UseMutationReturnType<void, Error, RevokeAccessVariables, unknown> {
  const queryClient = useQueryClient();
  const presentationApi = getPresentationApi();

  return useMutation({
    mutationFn: ({ presentationId, userId }: RevokeAccessVariables) =>
      presentationApi.revokeAccess(presentationId, userId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.presentations.sharedUsers(variables.presentationId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.presentations.shareState(variables.presentationId),
      });
    },
    ...options,
  });
}

interface SetPublicAccessVariables {
  presentationId: string;
  request: PublicAccessRequest;
}

/**
 * Hook to set public access for a presentation
 *
 * @example
 * ```ts
 * const mutation = useSetPublicAccess();
 * mutation.mutate({
 *   presentationId: '123',
 *   request: { isPublic: true, publicPermission: 'read' }
 * });
 * ```
 */
export function useSetPublicAccess(
  options?: UseMutationOptions<PublicAccessResponse, Error, SetPublicAccessVariables>
): UseMutationReturnType<PublicAccessResponse, Error, SetPublicAccessVariables, unknown> {
  const queryClient = useQueryClient();
  const presentationApi = getPresentationApi();

  return useMutation({
    mutationFn: ({ presentationId, request }: SetPublicAccessVariables) =>
      presentationApi.setPublicAccess(presentationId, request),
    onSuccess: (data, variables) => {
      // Update cache with new public access data
      queryClient.setQueryData(queryKeys.presentations.publicAccess(variables.presentationId), data);
      queryClient.invalidateQueries({
        queryKey: queryKeys.presentations.shareState(variables.presentationId),
      });
    },
    ...options,
  });
}

/**
 * Hook for streaming presentation generation
 * Note: This is a special case that doesn't use standard mutation hooks
 * due to the streaming nature of the response
 *
 * @example
 * ```ts
 * const presentationApi = getPresentationApi();
 * const abortController = new AbortController();
 *
 * const result = await presentationApi.streamPresentation(request, abortController.signal);
 * for await (const chunk of result.stream) {
 *   console.log('Received chunk:', chunk);
 * }
 * ```
 */
export function useStreamPresentation() {
  // For streaming, we don't use useMutation since it doesn't handle streams well
  // Instead, return the API method directly for manual usage
  const presentationApi = getPresentationApi();
  return {
    streamPresentation: presentationApi.streamPresentation.bind(presentationApi),
  };
}
