import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import type { SortingState, PaginationState, Updater } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { useClassApiService } from '../api';
import type {
  ClassCollectionRequest,
  ClassCreateRequest,
  ClassUpdateRequest,
  StudentEnrollmentRequest,
  StudentTransferRequest,
  TeacherAssignmentRequest,
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

// Teacher assignment mutations
export function useAssignTeacherToClass() {
  const queryClient = useQueryClient();
  const classApiService = useClassApiService();

  return useMutation({
    mutationFn: (data: TeacherAssignmentRequest) => classApiService.assignTeacherToClass(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: classKeys.teachers(variables.classId) });
      queryClient.invalidateQueries({ queryKey: classKeys.detail(variables.classId) });
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
    },
  });
}

export function useRemoveTeacherFromClass() {
  const queryClient = useQueryClient();
  const classApiService = useClassApiService();

  return useMutation({
    mutationFn: ({ classId, teacherId, subject }: { classId: string; teacherId: string; subject?: string }) =>
      classApiService.removeTeacherFromClass(classId, teacherId, subject),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: classKeys.teachers(variables.classId) });
      queryClient.invalidateQueries({ queryKey: classKeys.detail(variables.classId) });
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
