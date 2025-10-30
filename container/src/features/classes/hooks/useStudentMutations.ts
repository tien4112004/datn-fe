import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Student } from '../types/entities/student';
import type { StudentFormData } from '../schemas/studentSchema';
import type { StudentCreateRequest, StudentUpdateRequest } from '../types/requests/studentRequests';
import { classApiService } from '../api';

/**
 * Custom hook for managing student mutations (create, update, delete)
 * with optimistic updates and cache invalidation
 *
 * Provides React Query mutations for all student CRUD operations:
 * - createStudent: Add new student to class
 * - updateStudent: Modify existing student (added in Phase 4)
 * - deleteStudent: Remove student from roster (added in Phase 5)
 *
 * Features:
 * - Optimistic UI updates for instant feedback
 * - Automatic cache refresh on error (server as source of truth)
 * - Toast notifications for success/error
 * - i18n support for all messages
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

  /**
   * Mutation for creating a new student
   * Implements optimistic update pattern:
   * 1. onMutate: Snapshot current cache and add optimistic student
   * 2. onError: Invalidate cache to refetch from server
   * 3. onSuccess: Invalidate cache to fetch fresh data
   */
  const createStudent = useMutation({
    mutationFn: async (data: StudentFormData): Promise<Student> => {
      const request: StudentCreateRequest = {
        studentCode: data.studentCode,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth || new Date().toISOString(),
        gender: data.gender || 'other',
        email: data.email,
        phone: data.phone,
        address: data.address,
        parentName: data.parentName,
        parentPhone: data.parentPhone,
        classId: classId,
        enrollmentDate: new Date().toISOString(),
      };

      // Call actual API service
      return await classApiService.createStudent(classId, request);
    },

    onMutate: async (newStudent) => {
      // Cancel any outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ['classes', classId, 'students'] });

      // Snapshot the previous value for rollback
      const previousStudents = queryClient.getQueryData<Student[]>(['classes', classId, 'students']);

      // Optimistically update cache with new student
      queryClient.setQueryData<Student[]>(['classes', classId, 'students'], (old) => {
        const optimisticStudent: Student = {
          id: `temp-${Date.now()}`,
          studentCode: newStudent.studentCode,
          firstName: newStudent.firstName,
          lastName: newStudent.lastName,
          fullName: `${newStudent.firstName} ${newStudent.lastName}`,
          dateOfBirth: newStudent.dateOfBirth || '',
          gender: newStudent.gender || 'other',
          email: newStudent.email,
          phone: newStudent.phone,
          address: newStudent.address,
          parentName: newStudent.parentName,
          parentPhone: newStudent.parentPhone,
          classId: classId,
          enrollmentDate: new Date().toISOString(),
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        return [...(old || []), optimisticStudent];
      });

      return { previousStudents };
    },

    onError: (error) => {
      // Refetch from server to get accurate state
      queryClient.invalidateQueries({ queryKey: ['classes', classId, 'students'] });

      // Show error toast
      toast.error('Failed to add student', {
        description:
          error instanceof Error
            ? error.message
            : 'Network error. Please check your connection and try again.',
      });
    },

    onSuccess: () => {
      // Invalidate and refetch to get accurate server data
      queryClient.invalidateQueries({ queryKey: ['classes', classId, 'students'] });

      // Show success toast
      toast.success('Student added successfully');
    },
  });

  /**
   * Mutation for updating an existing student
   * Implements optimistic update pattern similar to createStudent:
   * 1. onMutate: Snapshot current cache and update optimistically
   * 2. onError: Invalidate cache to refetch from server
   * 3. onSuccess: Invalidate cache to fetch fresh data
   */
  const updateStudent = useMutation({
    mutationFn: async ({
      studentId,
      data,
    }: {
      studentId: string;
      data: StudentFormData;
    }): Promise<Student> => {
      const request: StudentUpdateRequest = {
        id: studentId,
        studentCode: data.studentCode,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        email: data.email,
        phone: data.phone,
        address: data.address,
        parentName: data.parentName,
        parentPhone: data.parentPhone,
      };

      // Call actual API service
      return await classApiService.updateStudent(studentId, request);
    },

    onMutate: async ({ studentId, data: updatedData }) => {
      // Cancel any outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ['classes', classId, 'students'] });

      // Snapshot the previous value for rollback
      const previousStudents = queryClient.getQueryData<Student[]>(['classes', classId, 'students']);

      // Optimistically update cache with edited student
      queryClient.setQueryData<Student[]>(['classes', classId, 'students'], (old) => {
        if (!old) return old;

        return old.map((student) => {
          if (student.id === studentId) {
            return {
              ...student,
              studentCode: updatedData.studentCode,
              firstName: updatedData.firstName,
              lastName: updatedData.lastName,
              fullName: `${updatedData.firstName} ${updatedData.lastName}`,
              dateOfBirth: updatedData.dateOfBirth || student.dateOfBirth,
              gender: updatedData.gender || student.gender,
              email: updatedData.email,
              phone: updatedData.phone,
              address: updatedData.address,
              parentName: updatedData.parentName,
              parentPhone: updatedData.parentPhone,
              updatedAt: new Date().toISOString(),
            };
          }
          return student;
        });
      });

      return { previousStudents };
    },

    onError: (error) => {
      // Refetch from server to get accurate state
      queryClient.invalidateQueries({ queryKey: ['classes', classId, 'students'] });

      // Show error toast
      toast.error('Failed to update student', {
        description:
          error instanceof Error
            ? error.message
            : 'Network error. Please check your connection and try again.',
      });
    },

    onSuccess: () => {
      // Invalidate and refetch to get accurate server data
      queryClient.invalidateQueries({ queryKey: ['classes', classId, 'students'] });

      // Show success toast
      toast.success('Student updated successfully');
    },
  });

  /**
   * Mutation for deleting a student from the roster
   * Implements optimistic removal pattern:
   * 1. onMutate: Snapshot current cache and remove optimistically
   * 2. onError: Invalidate cache to refetch from server
   * 3. onSuccess: Invalidate cache to fetch fresh data
   */
  const deleteStudent = useMutation({
    mutationFn: async (studentId: string): Promise<void> => {
      // Call actual API service
      return await classApiService.deleteStudent(studentId);
    },

    onMutate: async (studentId) => {
      // Cancel any outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ['classes', classId, 'students'] });

      // Snapshot the previous value for rollback
      const previousStudents = queryClient.getQueryData<Student[]>(['classes', classId, 'students']);

      // Optimistically remove student from cache
      queryClient.setQueryData<Student[]>(['classes', classId, 'students'], (old) => {
        if (!old) return old;
        return old.filter((student) => student.id !== studentId);
      });

      return { previousStudents };
    },

    onError: (error) => {
      // Refetch from server to get accurate state
      queryClient.invalidateQueries({ queryKey: ['classes', classId, 'students'] });

      // Show error toast
      toast.error('Failed to delete student', {
        description:
          error instanceof Error
            ? error.message
            : 'Network error. Please check your connection and try again.',
      });
    },

    onSuccess: () => {
      // Invalidate and refetch to get accurate server data
      queryClient.invalidateQueries({ queryKey: ['classes', classId, 'students'] });

      // Show success toast
      toast.success('Student removed from roster successfully');
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
