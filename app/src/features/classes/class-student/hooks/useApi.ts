import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useClassApiService, classApiService } from '@/features/classes/shared/api';
import type { StudentEnrollmentRequest, Layout } from '@/features/classes/shared/types';
import type { Student } from '../types/student';
import type { StudentFormData } from './useStudentForm';
import type { StudentCreateRequest, StudentUpdateRequest } from '../types/requests';
import { useTranslation } from 'react-i18next';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';

// Query keys for students
const classKeys = {
  all: ['classes'] as const,
  lists: () => [...classKeys.all, 'list'] as const,
  details: () => [...classKeys.all, 'detail'] as const,
  detail: (id: string) => [...classKeys.details(), id] as const,
  students: (classId: string) => [...classKeys.all, 'students', classId] as const,
  capacity: (classId: string) => [...classKeys.all, 'capacity', classId] as const,
  seatingChart: (classId: string) => [...classKeys.all, 'seating-chart', classId] as const,
};

// Student queries
export function useClassStudents(classId: string) {
  const classApiService = useClassApiService();

  return useQuery({
    queryKey: classKeys.students(classId),
    queryFn: () => classApiService.getStudentsByClassId(classId),
    enabled: !!classId,
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

/**
 * Custom hook for managing student mutations (create, update, delete)
 * with automatic cache invalidation
 *
 * Provides React Query mutations for all student CRUD operations:
 * - createStudent: Add new student to class
 * - updateStudent: Modify existing student
 * - deleteStudent: Remove student from roster
 *
 * Features:
 * - Automatic cache refresh after mutations
 * - Toast notifications for success/error
 * - Loading states for UI feedback
 *
 * @example
 * ```tsx
 * const { createStudent, isCreating } = useStudentMutations(classId);
 *
 * const handleSubmit = (data: StudentFormData) => {
 *   createStudent.mutate(data);
 * };
 * ```
 */
export function useStudentMutations(classId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation(I18N_NAMESPACES.CLASSES);

  /**
   * Mutation for creating a new student
   */
  const createStudent = useMutation({
    mutationFn: async (data: StudentFormData): Promise<Student> => {
      const request: StudentCreateRequest = {
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth || undefined,
        gender: data.gender || undefined,
        address: data.address || undefined,
        parentName: data.parentName || '',
        parentPhone: data.parentPhone || '',
        parentContactEmail: undefined,
        classId: classId,
        enrollmentDate: undefined,
      };

      return await classApiService.createStudent(classId, request);
    },

    onError: (error) => {
      toast.error(t('roster.addStudent.error'), {
        description: t('roster.addStudent.errorDescription', {
          error: error instanceof Error ? error.message : 'Network error',
        }),
      });
    },

    onSuccess: () => {
      // Invalidate and refetch to get fresh server data
      queryClient.invalidateQueries({ queryKey: ['classes', classId, 'students'] });
      toast.success(t('roster.addStudent.success'));
    },
  });

  /**
   * Mutation for updating an existing student
   */
  const updateStudent = useMutation({
    mutationFn: async ({
      studentId,
      data,
    }: {
      studentId: string;
      data: StudentFormData;
    }): Promise<Student> => {
      // Split fullName into firstName and lastName
      const nameParts = data.fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || firstName;

      const request: StudentUpdateRequest = {
        id: studentId,
        firstName,
        lastName,
        phoneNumber: data.parentPhone || null,
        address: data.address || null,
        parentContactEmail: null,
        avatarUrl: null,
      };

      return await classApiService.updateStudent(studentId, request);
    },

    onError: (error) => {
      toast.error(t('roster.updateStudent.error'), {
        description: t('roster.updateStudent.errorDescription', {
          error: error instanceof Error ? error.message : 'Network error',
        }),
      });
    },

    onSuccess: () => {
      // Invalidate and refetch to get fresh server data
      queryClient.invalidateQueries({ queryKey: ['classes', classId, 'students'] });
      toast.success(t('roster.updateStudent.success'));
    },
  });

  /**
   * Mutation for deleting a student from the roster
   */
  const deleteStudent = useMutation({
    mutationFn: async (studentId: string): Promise<void> => {
      return await classApiService.deleteStudent(studentId);
    },

    onError: (error) => {
      toast.error(t('roster.deleteStudent.error'), {
        description: t('roster.deleteStudent.errorDescription', {
          error: error instanceof Error ? error.message : 'Network error',
        }),
      });
    },

    onSuccess: () => {
      // Invalidate and refetch to get fresh server data
      queryClient.invalidateQueries({ queryKey: ['classes', classId, 'students'] });
      toast.success(t('roster.deleteStudent.success'));
    },
  });

  return {
    createStudent,
    isCreating: createStudent.isPending,
    updateStudent,
    isUpdating: updateStudent.isPending,
    deleteStudent,
    isDeleting: deleteStudent.isPending,
  };
}

// Seating chart queries
export function useSeatingChart(classId: string) {
  const classApiService = useClassApiService();

  return useQuery({
    queryKey: classKeys.seatingChart(classId),
    queryFn: () => classApiService.getSeatingChart(classId),
    enabled: !!classId,
  });
}

// Seating chart mutations
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
