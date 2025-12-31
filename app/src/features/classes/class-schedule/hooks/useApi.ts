import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { useClassApiService } from '../../shared/api';
import { getSubjectsByGrade } from '../../shared/types/constants/subjects';
import type {
  ScheduleCollectionRequest,
  SchedulePeriodCreateRequest,
  SchedulePeriodUpdateRequest,
} from '../../shared/types';

// Query keys for schedules
const classKeys = {
  all: ['classes'] as const,
  schedules: (classId: string, params?: ScheduleCollectionRequest) =>
    [...classKeys.all, 'schedules', classId, params] as const,
  periods: (classId: string, params?: { date?: string; startDate?: string; endDate?: string }) =>
    [...classKeys.all, 'periods', classId, params] as const,
  calendarEvents: (classId: string, monthKey: string) =>
    [...classKeys.all, 'calendar-periods', classId, monthKey] as const,
  subjects: (classId: string) => [...classKeys.all, 'subjects', classId] as const,
};

// Schedule queries
export function useClassSchedules(classId: string, params: ScheduleCollectionRequest = {}) {
  const classApiService = useClassApiService();
  return useQuery({
    queryKey: classKeys.schedules(classId, params),
    queryFn: () => classApiService.getSchedules(classId, params),
    enabled: !!classId,
  });
}

// Schedule mutations
export function useAddPeriod() {
  const queryClient = useQueryClient();
  const classApiService = useClassApiService();

  return useMutation({
    mutationFn: ({ classId, data }: { classId: string; data: SchedulePeriodCreateRequest }) =>
      classApiService.addSchedulePeriod(classId, data),
    onSuccess: (period) => {
      queryClient.invalidateQueries({ queryKey: classKeys.periods(period.classId, {}) });
      queryClient.invalidateQueries({ queryKey: classKeys.schedules(period.classId, {}) });
    },
  });
}

export function useUpdatePeriod() {
  const queryClient = useQueryClient();
  const classApiService = useClassApiService();

  return useMutation({
    mutationFn: ({
      classId,
      id,
      updates,
    }: {
      classId: string;
      id: string;
      updates: SchedulePeriodUpdateRequest;
    }) => classApiService.updateSchedulePeriod(classId, id, updates),
    onSuccess: (period) => {
      queryClient.invalidateQueries({ queryKey: classKeys.periods(period.classId, {}) });
      queryClient.invalidateQueries({ queryKey: classKeys.schedules(period.classId, {}) });
    },
  });
}

export function useLinkLessonToPeriod() {
  const queryClient = useQueryClient();
  const classApiService = useClassApiService();

  return useMutation({
    mutationFn: ({ classId, periodId, lessonId }: { classId: string; periodId: string; lessonId: string }) =>
      classApiService.linkLessonToSchedulePeriod(classId, periodId, lessonId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: classKeys.periods(variables.classId, {}) });
      queryClient.invalidateQueries({ queryKey: classKeys.schedules(variables.classId, {}) });
    },
  });
}

export function useUnlinkLessonFromPeriod() {
  const queryClient = useQueryClient();
  const classApiService = useClassApiService();

  return useMutation({
    mutationFn: ({ classId, periodId, lessonId }: { classId: string; periodId: string; lessonId: string }) =>
      classApiService.unlinkLessonFromSchedulePeriod(classId, periodId, lessonId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: classKeys.periods(variables.classId, {}) });
      queryClient.invalidateQueries({ queryKey: classKeys.schedules(variables.classId, {}) });
    },
  });
}

// Calendar Events
export function useCalendarPeriods(classId: string, selectedDate: Date) {
  const classApiService = useClassApiService();

  // Calculate date range for the selected month
  const startDate = startOfMonth(selectedDate);
  const endDate = endOfMonth(selectedDate);

  // Format dates for API query (YYYY-MM-DD)
  const startDateStr = format(startDate, 'yyyy-MM-dd');
  const endDateStr = format(endDate, 'yyyy-MM-dd');

  // Format month for query key (YYYY-MM)
  const monthKey = format(selectedDate, 'yyyy-MM');

  const { data, isLoading, error, isFetching, refetch } = useQuery({
    queryKey: classKeys.calendarEvents(classId, monthKey),
    queryFn: () =>
      classApiService.getSchedulePeriods(classId, {
        startDate: startDateStr,
        endDate: endDateStr,
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!classId,
  });

  return {
    periods: data?.data ?? [],
    isLoading,
    error: error as Error | null,
    isFetching,
    refetch,
  };
}

// Period queries
export function useClassPeriods(
  classId: string,
  params: { date?: string; startDate?: string; endDate?: string } = {}
) {
  const classApiService = useClassApiService();
  return useQuery({
    queryKey: classKeys.periods(classId, params),
    queryFn: () => classApiService.getSchedulePeriods(classId, params),
    enabled: !!classId,
  });
}

export function usePeriod(id: string) {
  const classApiService = useClassApiService();

  return useQuery({
    queryKey: ['period', id],
    queryFn: () => classApiService.getPeriodById(id),
    enabled: !!id,
  });
}

export function useSubjectPeriods(classId: string, subjectCode: string | null) {
  const classApiService = useClassApiService();

  return useQuery({
    queryKey: ['subject-periods', classId, subjectCode],
    queryFn: async () => {
      if (!subjectCode) {
        return Promise.resolve([]);
      }
      return await classApiService.getPeriodsBySubject(classId, subjectCode);
    },
    enabled: !!classId && !!subjectCode,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSubjects(classId: string) {
  const classApiService = useClassApiService();

  return useQuery({
    queryKey: classKeys.subjects(classId),
    queryFn: async () => {
      const cls = await classApiService.getClassById(classId);
      if (!cls) {
        return [];
      }
      const subjects = getSubjectsByGrade(cls.grade || cls.settings?.grade || 1);
      return subjects.map((subject) => subject.code);
    },
    enabled: !!classId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
