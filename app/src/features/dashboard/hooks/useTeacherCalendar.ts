import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useDashboardApiService } from '../api';
import type { CalendarEvent } from '../api/types';
import type { ApiResponse } from '@aiprimary/api';
import { format } from 'date-fns';

export interface UseTeacherCalendarReturn extends Omit<UseQueryResult<ApiResponse<CalendarEvent[]>>, 'data'> {
  events: CalendarEvent[];
  isLoading: boolean;
}

/**
 * Hook to fetch teacher calendar events
 */
export const useTeacherCalendar = (startDate?: Date, endDate?: Date): UseTeacherCalendarReturn => {
  const dashboardApiService = useDashboardApiService();

  const startDateStr = startDate ? format(startDate, 'yyyy-MM-dd') : undefined;
  const endDateStr = endDate ? format(endDate, 'yyyy-MM-dd') : undefined;

  const { data, ...query } = useQuery<ApiResponse<CalendarEvent[]>>({
    queryKey: [dashboardApiService.getType(), 'teacherCalendar', startDateStr, endDateStr],
    queryFn: async () => {
      return await dashboardApiService.getTeacherCalendar(startDateStr, endDateStr);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true,
  });

  return {
    events: data?.data || [],
    ...query,
  };
};
