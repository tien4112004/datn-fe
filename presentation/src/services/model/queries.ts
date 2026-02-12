import { useQuery, type UseQueryOptions, type UseQueryReturnType } from '@tanstack/vue-query';
import { getModelApi } from './api';
import { queryKeys } from '../query-keys';
import type { ModelInfo, ModelType } from './types';

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Hook to fetch available models by type
 *
 * @example
 * ```ts
 * const { data: textModels, isLoading } = useModels('TEXT');
 * const { data: imageModels } = useModels('IMAGE');
 * ```
 */
export function useModels(
  modelType: ModelType,
  options?: Omit<UseQueryOptions<ModelInfo[], Error>, 'queryKey' | 'queryFn'>
): UseQueryReturnType<ModelInfo[], Error> {
  const modelApi = getModelApi();

  return useQuery({
    queryKey: queryKeys.models.list(modelType),
    queryFn: () => modelApi.fetchModels(modelType),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
}

/**
 * Hook to fetch the default model by type
 *
 * @example
 * ```ts
 * const { data: defaultTextModel, isLoading } = useDefaultModel('TEXT');
 * const { data: defaultImageModel } = useDefaultModel('IMAGE');
 * ```
 */
export function useDefaultModel(
  modelType: ModelType,
  options?: Omit<UseQueryOptions<ModelInfo | null, Error>, 'queryKey' | 'queryFn'>
): UseQueryReturnType<ModelInfo | null, Error> {
  const modelApi = getModelApi();

  return useQuery({
    queryKey: queryKeys.models.default(modelType),
    queryFn: () => modelApi.fetchDefaultModel(modelType),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
}
