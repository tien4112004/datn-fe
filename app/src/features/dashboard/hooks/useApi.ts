import { useQuery, type UseQueryResult } from '@tanstack/react-query';
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

export const useAllDocuments = (request: AllDocumentsRequest): UseAllDocumentsReturn => {
  const dashboardApiService = useDashboardApiService();

  const { data, isLoading, isError } = useQuery<ApiResponse<DocumentItem[]>>({
    queryKey: [dashboardApiService.getType(), 'allDocuments', request],
    queryFn: () => dashboardApiService.getAllDocuments(request),
    staleTime: 30 * 1000,
  });

  return {
    documents: data?.data || [],
    totalItems: data?.pagination?.totalItems ?? 0,
    totalPages: data?.pagination?.totalPages ?? 0,
    isLoading,
    isError,
  };
};
