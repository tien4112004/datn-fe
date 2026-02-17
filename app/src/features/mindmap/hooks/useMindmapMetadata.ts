import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useMindmapApiService } from '../api';
import type { MindmapMetadataResponse } from '../types';

/**
 * Hook to fetch mindmap metadata for AI context enrichment
 * Includes caching via React Query to avoid redundant API calls
 *
 * @param mindmapId - The ID of the mindmap
 * @param enabled - Whether to enable the query (default: true)
 * @returns Query result with metadata
 */
export const useMindmapMetadata = (
  mindmapId: string | undefined,
  enabled = true
): UseQueryResult<MindmapMetadataResponse> => {
  const mindmapApiService = useMindmapApiService();

  return useQuery({
    queryKey: ['mindmapMetadata', mindmapId],
    queryFn: () => {
      if (!mindmapId) {
        throw new Error('Mindmap ID is required');
      }
      return mindmapApiService.getMindmapMetadata(mindmapId);
    },
    enabled: enabled && !!mindmapId,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
};
