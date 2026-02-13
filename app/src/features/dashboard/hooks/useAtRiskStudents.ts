import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useDashboardApiService } from '../api';
import type { ClassAtRiskStudents } from '../api/types';
import type { ApiResponse } from '@aiprimary/api';

export interface UseAtRiskStudentsReturn extends Omit<
  UseQueryResult<ApiResponse<ClassAtRiskStudents[]>>,
  'data'
> {
  classes: ClassAtRiskStudents[];
  totalAtRiskCount: number;
  isLoading: boolean;
}

/**
 * Hook to fetch at-risk students grouped by class
 */
export const useAtRiskStudents = (): UseAtRiskStudentsReturn => {
  const dashboardApiService = useDashboardApiService();

  const { data, ...query } = useQuery<ApiResponse<ClassAtRiskStudents[]>>({
    queryKey: [dashboardApiService.getType(), 'atRiskStudents'],
    queryFn: async () => {
      return await dashboardApiService.getAtRiskStudents();
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    enabled: true,
  });

  const classes = data?.data || [];
  const totalAtRiskCount = classes.reduce((sum, cls) => sum + cls.atRiskCount, 0);

  return {
    classes,
    totalAtRiskCount,
    ...query,
  };
};
