import { useQuery, useInfiniteQuery, type UseQueryResult } from '@tanstack/react-query';
import { useDashboardApiService } from '../api';
import type { DocumentItem, AllDocumentsRequest } from '../api/types';
import type { ApiResponse } from '@aiprimary/api';

export interface UseRecentDocumentsReturn extends Omit<UseQueryResult<ApiResponse<DocumentItem[]>>, 'data'> {
  documents: DocumentItem[];
  isLoading: boolean;
}

/**
 * Hook to fetch recent documents from the dashboard API
 * Provides data loading state and refetch functionality
 */
export const useRecentDocuments = (limit: number): UseRecentDocumentsReturn => {
  const dashboardApiService = useDashboardApiService();

  const { data, ...query } = useQuery<ApiResponse<DocumentItem[]>>({
    queryKey: [dashboardApiService.getType(), 'recentDocuments', limit],
    queryFn: async () => {
      return await dashboardApiService.getRecentDocuments({ limit });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true,
  });

  return {
    documents: data?.data || [],
    ...query,
  };
};

export interface UseAllDocumentsReturn {
  documents: DocumentItem[];
  totalItems: number;
  totalPages: number;
  isLoading: boolean;
  isError: boolean;
}

export const useAllDocuments = (
  request: AllDocumentsRequest & { enabled?: boolean }
): UseAllDocumentsReturn => {
  const dashboardApiService = useDashboardApiService();
  const { enabled = true, ...params } = request;

  const { data, isLoading, isError } = useQuery<ApiResponse<DocumentItem[]>>({
    queryKey: [dashboardApiService.getType(), 'allDocuments', params],
    queryFn: () => dashboardApiService.getAllDocuments(params),
    staleTime: 30 * 1000,
    enabled,
  });

  return {
    documents: data?.data || [],
    totalItems: data?.pagination?.totalItems ?? 0,
    totalPages: data?.pagination?.totalPages ?? 0,
    isLoading,
    isError,
  };
};

export interface UseInfiniteAllDocumentsReturn {
  documents: DocumentItem[];
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  isLoading: boolean;
}

export const useInfiniteAllDocuments = (
  request: Omit<AllDocumentsRequest, 'page' | 'pageSize'> & { enabled?: boolean }
): UseInfiniteAllDocumentsReturn => {
  const dashboardApiService = useDashboardApiService();
  const PAGE_SIZE = 20;
  const { enabled = true, ...params } = request;

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: [dashboardApiService.getType(), 'allDocumentsInfinite', params],
    queryFn: ({ pageParam }) =>
      dashboardApiService.getAllDocuments({ ...params, page: pageParam as number, pageSize: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.pagination ?? {};
      if (currentPage == null || totalPages == null) return undefined;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    staleTime: 30 * 1000,
    enabled,
  });

  const documents = data?.pages.flatMap((p) => p.data) ?? [];

  return { documents, hasNextPage: hasNextPage ?? false, fetchNextPage, isFetchingNextPage, isLoading };
};
