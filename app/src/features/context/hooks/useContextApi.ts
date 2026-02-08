import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useContextApiService } from '../api';
import type { ContextFilters } from '../types';

// Export the API service hook for direct use
export { useContextApiService } from '../api';

// Query key factory
export const contextKeys = {
  all: ['contexts'] as const,
  lists: () => [...contextKeys.all, 'list'] as const,
  list: (filters: ContextFilters) => [...contextKeys.lists(), filters] as const,
  infiniteLists: () => [...contextKeys.all, 'infinite-list'] as const,
  infiniteList: (filters: Omit<ContextFilters, 'page' | 'pageSize'>) =>
    [...contextKeys.infiniteLists(), filters] as const,
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

const CONTEXT_PAGE_SIZE = 10;

// GET all contexts with infinite scrolling
export const useInfiniteContextList = (filters: Omit<ContextFilters, 'page' | 'pageSize'> = {}) => {
  const apiService = useContextApiService();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useInfiniteQuery({
    queryKey: contextKeys.infiniteList(filters),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiService.getContexts({
        ...filters,
        page: pageParam,
        pageSize: CONTEXT_PAGE_SIZE,
      });
      return {
        contexts: response.data,
        pagination: response.pagination,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pagination = lastPage.pagination;
      if (!pagination) return undefined;
      if (pagination.currentPage >= pagination.totalPages) return undefined;
      return pagination.currentPage + 1;
    },
    staleTime: 30000,
    gcTime: 300000,
  });

  const contexts = data?.pages.flatMap((page) => page.contexts) || [];

  return {
    contexts,
    fetchNextPage,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    isLoading,
    isError,
  };
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
