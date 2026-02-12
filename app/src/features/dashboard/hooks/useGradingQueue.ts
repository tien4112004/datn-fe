import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useDashboardApiService } from '../api';
import type { GradingQueueItem } from '../api/types';
import type { ApiResponse } from '@aiprimary/api';

export interface UseGradingQueueReturn
  extends Omit<UseQueryResult<ApiResponse<GradingQueueItem[]>>, 'data'> {
  queue: GradingQueueItem[];
  isLoading: boolean;
}

/**
 * Hook to fetch grading queue for teacher
 */
export const useGradingQueue = (page: number = 0, size: number = 50): UseGradingQueueReturn => {
  const dashboardApiService = useDashboardApiService();

  const { data, ...query } = useQuery<ApiResponse<GradingQueueItem[]>>({
    queryKey: [dashboardApiService.getType(), 'gradingQueue', page, size],
    queryFn: async () => {
      return await dashboardApiService.getGradingQueue(page, size);
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    enabled: true,
  });

  return {
    queue: data?.data || [],
    ...query,
  };
};
