import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Student } from '../types/entities/student';
import type { StudentFormData } from '../schemas/studentSchema';
import type { StudentCreateRequest, StudentUpdateRequest } from '../types/requests/studentRequests';
import { classApiService } from '../api';

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

  /**
   * Mutation for creating a new student
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

      return await classApiService.createStudent(classId, request);
    },

    onError: (error) => {
      toast.error('Failed to add student', {
        description:
          error instanceof Error
            ? error.message
            : 'Network error. Please check your connection and try again.',
      });
    },

    onSuccess: () => {
      // Invalidate and refetch to get fresh server data
      queryClient.invalidateQueries({ queryKey: ['classes', classId, 'students'] });
      toast.success('Student added successfully');
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

      return await classApiService.updateStudent(studentId, request);
    },

    onError: (error) => {
      toast.error('Failed to update student', {
        description:
          error instanceof Error
            ? error.message
            : 'Network error. Please check your connection and try again.',
      });
    },

    onSuccess: () => {
      // Invalidate and refetch to get fresh server data
      queryClient.invalidateQueries({ queryKey: ['classes', classId, 'students'] });
      toast.success('Student updated successfully');
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
      toast.error('Failed to delete student', {
        description:
          error instanceof Error
            ? error.message
            : 'Network error. Please check your connection and try again.',
      });
    },

    onSuccess: () => {
      // Invalidate and refetch to get fresh server data
      queryClient.invalidateQueries({ queryKey: ['classes', classId, 'students'] });
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
