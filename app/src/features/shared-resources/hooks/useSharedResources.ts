import { useQuery } from '@tanstack/react-query';
import { useSharedResourceApiService } from '../api';
import type { SharedResource, ResourceType } from '../types';

export interface UseSharedResourcesParams {
  type?: ResourceType;
}

export interface UseSharedResourcesReturn {
  data: SharedResource[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useSharedResources = (params?: UseSharedResourcesParams): UseSharedResourcesReturn => {
  const sharedResourceApiService = useSharedResourceApiService();

  const { data, isLoading, isError, error, refetch } = useQuery<SharedResource[]>({
    queryKey: [sharedResourceApiService.getType(), 'shared-resources', params?.type],
    queryFn: async (): Promise<SharedResource[]> => {
      const resources = await sharedResourceApiService.getSharedWithMe();
      // Filter by type if specified
      if (params?.type) {
        return resources.filter((r) => r.type === params.type);
      }
      return resources;
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 300000, // Keep in cache for 5 minutes
  });

  return {
    data: data || [],
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
};
