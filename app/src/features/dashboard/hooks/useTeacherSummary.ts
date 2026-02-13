import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useDashboardApiService } from '../api';
import type { TeacherSummary } from '../api/types';
import type { ApiResponse } from '@aiprimary/api';

export interface UseTeacherSummaryReturn extends Omit<UseQueryResult<ApiResponse<TeacherSummary>>, 'data'> {
  summary: TeacherSummary | null;
  isLoading: boolean;
}

/**
 * Hook to fetch teacher dashboard summary metrics
 */
export const useTeacherSummary = (): UseTeacherSummaryReturn => {
  const dashboardApiService = useDashboardApiService();

  const { data, ...query } = useQuery<ApiResponse<TeacherSummary>>({
    queryKey: [dashboardApiService.getType(), 'teacherSummary'],
    queryFn: async () => {
      return await dashboardApiService.getTeacherSummary();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: true,
  });

  return {
    summary: data?.data || null,
    ...query,
  };
};
