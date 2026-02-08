import { useQuery } from '@tanstack/react-query';
import { useContextApiService } from '../api/context.index';
import type { ContextFilters } from '../types/context';

// Export the API service hook for direct use
export { useContextApiService } from '../api/context.index';

// Query key factory
export const contextKeys = {
  all: ['contexts'] as const,
  lists: () => [...contextKeys.all, 'list'] as const,
  list: (filters: ContextFilters) => [...contextKeys.lists(), filters] as const,
  details: () => [...contextKeys.all, 'detail'] as const,
  detail: (id: string) => [...contextKeys.details(), id] as const,
};

// GET all contexts with filters
export const useContextList = (filters: ContextFilters = {}) => {
  const apiService = useContextApiService();

  return useQuery({
    queryKey: contextKeys.list(filters),
    queryFn: async () => {
      const response = await apiService.getContexts(filters);
      return {
        contexts: response.data,
        total: response.pagination?.totalItems || 0,
        page: response.pagination?.currentPage || 1,
        limit: response.pagination?.pageSize || 10,
      };
    },
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
  });
};

// GET single context by ID
export const useContext = (id: string | undefined) => {
  const apiService = useContextApiService();

  return useQuery({
    queryKey: contextKeys.detail(id || ''),
    queryFn: () => apiService.getContextById(id!),
    enabled: !!id,
  });
};
