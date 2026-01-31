import { useQuery, type UseQueryOptions, type UseQueryReturnType } from '@tanstack/vue-query';
import { getTemplateApi } from './api';
import { queryKeys } from '../query-keys';
import type { SlideTemplate } from '@aiprimary/core';
import type { MaybeRef } from 'vue';
import { unref } from 'vue';

/**
 * Hook to fetch all slide templates
 *
 * @example
 * ```ts
 * const { data: templates, isLoading, error } = useSlideTemplates();
 * ```
 */
export function useSlideTemplates(
  options?: Omit<UseQueryOptions<SlideTemplate[], Error>, 'queryKey' | 'queryFn'>
): UseQueryReturnType<SlideTemplate[], Error> {
  const templateApi = getTemplateApi();

  return useQuery({
    queryKey: queryKeys.templates.lists(),
    queryFn: () => templateApi.getSlideTemplates(),
    staleTime: 1000 * 60 * 10, // Templates don't change often, cache for 10 minutes
    ...options,
  });
}

/**
 * Hook to fetch slide templates filtered by layout type
 *
 * @param layoutType - The layout type to filter by (reactive or static)
 * @example
 * ```ts
 * const layoutType = ref('title-slide');
 * const { data: templates, isLoading } = useSlideTemplatesByLayout(layoutType);
 * ```
 */
export function useSlideTemplatesByLayout(
  layoutType: MaybeRef<string>,
  options?: Omit<UseQueryOptions<SlideTemplate[], Error>, 'queryKey' | 'queryFn'>
): UseQueryReturnType<SlideTemplate[], Error> {
  const templateApi = getTemplateApi();

  return useQuery({
    queryKey: () => queryKeys.templates.byLayout(unref(layoutType)),
    queryFn: () => templateApi.getSlideTemplatesByLayout(unref(layoutType)),
    staleTime: 1000 * 60 * 10, // Templates don't change often, cache for 10 minutes
    enabled: () => !!unref(layoutType), // Only run query if layoutType is provided
    ...options,
  });
}
