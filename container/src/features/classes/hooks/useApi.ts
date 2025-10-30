import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import type { SortingState, PaginationState, Updater } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { useClassApiService } from '../api';
import type {
  ClassCollectionRequest,
  ClassCreateRequest,
  ClassUpdateRequest,
  StudentEnrollmentRequest,
  StudentTransferRequest,
  Layout,
} from '../types';
import type { ApiResponse } from '@/shared/types/api';
import type { Class } from '../types';

// Query keys
export const classKeys = {
  all: ['classes'] as const,
  lists: () => [...classKeys.all, 'list'] as const,
  list: (params: ClassCollectionRequest) => [...classKeys.lists(), params] as const,
  details: () => [...classKeys.all, 'detail'] as const,
  detail: (id: string) => [...classKeys.details(), id] as const,
  students: (classId: string) => [...classKeys.all, 'students', classId] as const,
  teachers: (classId: string) => [...classKeys.all, 'teachers', classId] as const,
  capacity: (classId: string) => [...classKeys.all, 'capacity', classId] as const,
  availableTeachers: (subject?: string) => ['teachers', 'available', subject] as const,
  seatingChart: (classId: string) => [...classKeys.all, 'seating-chart', classId] as const,

  // Teaching & Schedule related keys
  schedules: (classId: string, params?: any) => [...classKeys.all, 'schedules', classId, params] as const,
  periods: (classId: string, params?: any) => [...classKeys.all, 'periods', classId, params] as const,
  lessonPlans: (classId: string, params?: any) =>
    [...classKeys.all, 'lesson-plans', classId, params] as const,
  objectives: (lessonPlanId: string) => [...classKeys.all, 'objectives', lessonPlanId] as const,
  resources: (lessonPlanId: string) => [...classKeys.all, 'resources', lessonPlanId] as const,

  // Calendar related keys
  calendarEvents: (classId: string, monthKey: string) =>
    [...classKeys.all, 'calendar-events', classId, monthKey] as const,
};

// Return types for the hooks
export interface UseClassesReturn extends Omit<UseQueryResult<ApiResponse<Class[]>>, 'data'> {
  data: Class[];
  sorting: SortingState;
  setSorting: (updaterOrValue: Updater<SortingState>) => void;
  pagination: PaginationState;
  setPagination: (updaterOrValue: Updater<PaginationState>) => void;
  search: string;
  setSearch: (search: string) => void;
  totalItems: number;
}

// Classes queries
export function useClasses(initialParams: ClassCollectionRequest = {}): UseClassesReturn {
  const classApiService = useClassApiService();

  const [sorting, setSorting] = useState<SortingState>([
    { id: initialParams.sort?.split(':')[0] || 'name', desc: initialParams.sort?.split(':')[1] === 'desc' },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: initialParams.page || 0,
    pageSize: initialParams.pageSize || 10,
  });
  const [search, setSearch] = useState<string>(initialParams.search || '');

  // Build query params from state
  const queryParams: ClassCollectionRequest = {
    page: pagination.pageIndex,
    pageSize: pagination.pageSize,
    sort: sorting.length > 0 ? `${sorting[0].id}:${sorting[0].desc ? 'desc' : 'asc'}` : undefined,
    search: search.trim() || undefined,
    ...initialParams, // Include other filters (grade, academicYear, isActive)
  };

  const { data, ...query } = useQuery({
    queryKey: classKeys.list(queryParams),
    queryFn: () => classApiService.getClasses(queryParams),
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 300000, // Keep in cache for 5 minutes
  });

  useEffect(() => {
    if (data && data.pagination) {
      setPagination((prev) => ({
        ...prev,
        pageIndex: data.pagination?.currentPage ?? 0,
        pageSize: data.pagination?.pageSize ?? 10,
      }));
    }
  }, [data?.pagination]);

  const handleSortingChange = (updaterOrValue: Updater<SortingState>) => {
    const newSorting = typeof updaterOrValue === 'function' ? updaterOrValue(sorting) : updaterOrValue;
    setSorting(newSorting);
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  };

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  };

  return {
    data: data?.data || [],
    sorting,
    setSorting: handleSortingChange,
    pagination,
    setPagination,
    search,
    setSearch: handleSearchChange,
    totalItems: data?.pagination?.totalItems || 0,
    ...query,
  };
}

export function useClass(id: string) {
  const classApiService = useClassApiService();

  return useQuery({
    queryKey: classKeys.detail(id),
    queryFn: () => classApiService.getClassById(id),
    enabled: !!id,
  });
}

export function useClassStudents(classId: string) {
  const classApiService = useClassApiService();

  return useQuery({
    queryKey: classKeys.students(classId),
    queryFn: () => classApiService.getStudentsByClassId(classId),
    enabled: !!classId,
  });
}

export function useClassTeachers(classId: string) {
  const classApiService = useClassApiService();

  return useQuery({
    queryKey: classKeys.teachers(classId),
    queryFn: () => classApiService.getTeachersByClassId(classId),
    enabled: !!classId,
  });
}

export function useClassCapacity(classId: string) {
  const classApiService = useClassApiService();

  return useQuery({
    queryKey: classKeys.capacity(classId),
    queryFn: () => classApiService.getClassCapacityInfo(classId),
    enabled: !!classId,
  });
}

export function useAvailableTeachers(subject?: string) {
  const classApiService = useClassApiService();

  return useQuery({
    queryKey: classKeys.availableTeachers(subject),
    queryFn: () => classApiService.getAvailableTeachers(subject),
  });
}

export function useSeatingChart(classId: string) {
  const classApiService = useClassApiService();

  return useQuery({
    queryKey: classKeys.seatingChart(classId),
    queryFn: () => classApiService.getSeatingChart(classId),
    enabled: !!classId,
  });
}

// Teaching & Schedule queries
export function useClassSchedules(classId: string, params: any = {}) {
  const classApiService = useClassApiService();
  return useQuery({
    queryKey: classKeys.schedules(classId, params),
    queryFn: () => classApiService.getSchedules(classId, params),
    enabled: !!classId,
  });
}

export function useClassPeriods(classId: string, params: any = {}) {
  const classApiService = useClassApiService();
  return useQuery({
    queryKey: classKeys.periods(classId, params),
    queryFn: () => classApiService.getPeriods(classId, params),
    enabled: !!classId,
  });
}

export function useClassLessonPlans(classId: string, params: any = {}) {
  const classApiService = useClassApiService();
  return useQuery({
    queryKey: classKeys.lessonPlans(classId, params),
    queryFn: () => classApiService.getLessonPlans(classId, params),
    enabled: !!classId,
  });
}

export function useLessonObjectives(lessonPlanId: string) {
  const classApiService = useClassApiService();
  return useQuery({
    queryKey: classKeys.objectives(lessonPlanId),
    queryFn: () => classApiService.getLessonObjectives(lessonPlanId),
    enabled: !!lessonPlanId,
  });
}

export function useLessonResources(lessonPlanId: string) {
  const classApiService = useClassApiService();
  return useQuery({
    queryKey: classKeys.resources(lessonPlanId),
    queryFn: () => classApiService.getLessonResources(lessonPlanId),
    enabled: !!lessonPlanId,
  });
}

// Calendar Events
export function useCalendarEvents(classId: string, selectedDate: Date, enabled = true) {
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
      classApiService.getCalendarEvents(classId, {
        startDate: startDateStr,
        endDate: endDateStr,
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!classId && enabled,
  });

  return {
    events: data?.events ?? [],
    isLoading,
    error: error as Error | null,
    isFetching,
    refetch,
  };
}

// Class mutations

// Class mutations
export function useCreateClass() {
  const queryClient = useQueryClient();
  const classApiService = useClassApiService();

  return useMutation({
    mutationFn: (data: ClassCreateRequest) => classApiService.createClass(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
    },
  });
}

export function useUpdateClass() {
  const queryClient = useQueryClient();
  const classApiService = useClassApiService();

  return useMutation({
    mutationFn: (data: ClassUpdateRequest) => classApiService.updateClass(data),
    onSuccess: (updatedClass) => {
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
      queryClient.invalidateQueries({ queryKey: classKeys.detail(updatedClass.id) });
    },
  });
}

export function useDeleteClass() {
  const queryClient = useQueryClient();
  const classApiService = useClassApiService();

  return useMutation({
    mutationFn: (id: string) => classApiService.deleteClass(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
    },
  });
}

export function useSaveSeatingChart() {
  const queryClient = useQueryClient();
  const classApiService = useClassApiService();

  return useMutation({
    mutationFn: ({ classId, layout }: { classId: string; layout: Layout }) =>
      classApiService.saveSeatingChart(classId, layout),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: classKeys.seatingChart(variables.classId) });
    },
  });
}

// Student enrollment mutations
export function useEnrollStudent() {
  const queryClient = useQueryClient();
  const classApiService = useClassApiService();

  return useMutation({
    mutationFn: (data: StudentEnrollmentRequest) => classApiService.enrollStudent(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: classKeys.students(variables.classId) });
      queryClient.invalidateQueries({ queryKey: classKeys.capacity(variables.classId) });
      queryClient.invalidateQueries({ queryKey: classKeys.detail(variables.classId) });
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
    },
  });
}

export function useRemoveStudentFromClass() {
  const queryClient = useQueryClient();
  const classApiService = useClassApiService();

  return useMutation({
    mutationFn: ({ classId, studentId }: { classId: string; studentId: string }) =>
      classApiService.removeStudentFromClass(classId, studentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: classKeys.students(variables.classId) });
      queryClient.invalidateQueries({ queryKey: classKeys.capacity(variables.classId) });
      queryClient.invalidateQueries({ queryKey: classKeys.detail(variables.classId) });
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
    },
  });
}

export function useTransferStudent() {
  const queryClient = useQueryClient();
  const classApiService = useClassApiService();

  return useMutation({
    mutationFn: (data: StudentTransferRequest) => classApiService.transferStudent(data),
    onSuccess: (_, variables) => {
      // Invalidate both source and destination class data
      queryClient.invalidateQueries({ queryKey: classKeys.students(variables.fromClassId) });
      queryClient.invalidateQueries({ queryKey: classKeys.students(variables.toClassId) });
      queryClient.invalidateQueries({ queryKey: classKeys.capacity(variables.fromClassId) });
      queryClient.invalidateQueries({ queryKey: classKeys.capacity(variables.toClassId) });
      queryClient.invalidateQueries({ queryKey: classKeys.detail(variables.fromClassId) });
      queryClient.invalidateQueries({ queryKey: classKeys.detail(variables.toClassId) });
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
    },
  });
}

export function useAssignHomeroomTeacher() {
  const queryClient = useQueryClient();
  const classApiService = useClassApiService();

  return useMutation({
    mutationFn: ({ classId, teacherId }: { classId: string; teacherId: string }) =>
      classApiService.assignHomeroomTeacher(classId, teacherId),
    onSuccess: (updatedClass) => {
      queryClient.invalidateQueries({ queryKey: classKeys.teachers(updatedClass.id) });
      queryClient.invalidateQueries({ queryKey: classKeys.detail(updatedClass.id) });
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
    },
  });
}

// Lesson Plan mutations
export function useUpdateLessonStatus() {
  const queryClient = useQueryClient();
  const classApiService = useClassApiService();

  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) =>
      classApiService.updateLessonStatus(id, status, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: classKeys.lessonPlans(variables.id, {}) });
    },
  });
}

export function useUpdateObjective() {
  const queryClient = useQueryClient();
  const classApiService = useClassApiService();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      classApiService.updateObjective(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: classKeys.objectives(variables.id) });
    },
  });
}

export function useAddObjectiveNote() {
  const queryClient = useQueryClient();
  const classApiService = useClassApiService();

  return useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => classApiService.addObjectiveNote(id, note),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: classKeys.objectives(variables.id) });
    },
  });
}

export function useAddResource() {
  const queryClient = useQueryClient();
  const classApiService = useClassApiService();

  return useMutation({
    mutationFn: (resource: any) => classApiService.addResource(resource),
    onSuccess: (resource) => {
      queryClient.invalidateQueries({ queryKey: classKeys.resources(resource.lessonPlanId) });
    },
  });
}

export function useUpdateResource() {
  const queryClient = useQueryClient();
  const classApiService = useClassApiService();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      classApiService.updateResource(id, updates),
    onSuccess: (resource) => {
      queryClient.invalidateQueries({ queryKey: classKeys.resources(resource.lessonPlanId) });
    },
  });
}

export function useDeleteResource() {
  const queryClient = useQueryClient();
  const classApiService = useClassApiService();

  return useMutation({
    mutationFn: (id: string) => classApiService.deleteResource(id),
    onSuccess: (_, lessonPlanId) => {
      queryClient.invalidateQueries({ queryKey: classKeys.resources(lessonPlanId) });
    },
  });
}

export function useCreateLessonPlan() {
  const queryClient = useQueryClient();
  const classApiService = useClassApiService();

  return useMutation({
    mutationFn: (data: any) => classApiService.createLessonPlan(data),
    onSuccess: (lessonPlan) => {
      queryClient.invalidateQueries({ queryKey: classKeys.lessonPlans(lessonPlan.classId, {}) });
    },
  });
}

// Schedule mutations
export function useAddPeriod() {
  const queryClient = useQueryClient();
  const classApiService = useClassApiService();

  return useMutation({
    mutationFn: (data: any) => classApiService.addPeriod(data),
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
    mutationFn: ({ id, updates }: { id: string; updates: any }) => classApiService.updatePeriod(id, updates),
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
    mutationFn: ({ periodId, lessonPlanId }: { periodId: string; lessonPlanId: string }) =>
      classApiService.linkLessonToPeriod(periodId, lessonPlanId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: classKeys.periods(variables.periodId, {}) });
    },
  });
}

export function useUnlinkLessonFromPeriod() {
  const queryClient = useQueryClient();
  const classApiService = useClassApiService();

  return useMutation({
    mutationFn: (periodId: string) => classApiService.unlinkLessonFromPeriod(periodId),
    onSuccess: (_, periodId) => {
      queryClient.invalidateQueries({ queryKey: classKeys.periods(periodId, {}) });
    },
  });
}
