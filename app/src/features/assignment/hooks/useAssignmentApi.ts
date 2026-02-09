import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAssignmentApiService } from '../api';
import { assignmentKeys } from '../api/assignmentApi';
import type { CreateAssignmentRequest, UpdateAssignmentRequest, GenerateMatrixRequest } from '../types';

/**
 * Hook to fetch list of assignments with optional filters
 * @param filters - Optional filters for assignments
 * @returns Query result with assignments list
 */
export const useAssignmentList = (filters?: {
  classId?: string;
  status?: 'draft' | 'published' | 'archived';
  searchText?: string;
}) => {
  const service = getAssignmentApiService();

  return useQuery({
    queryKey: assignmentKeys.list(filters),
    queryFn: async () => {
      const response = await service.getAssignments({
        classId: filters?.classId,
        search: filters?.searchText,
      });
      return {
        assignments: response.data,
        total: response.pagination?.totalItems ?? response.data.length,
      };
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Hook to fetch a single assignment by ID
 * @param id - Assignment ID
 * @returns Query result with assignment details
 */
export const useAssignment = (id: string) => {
  const service = getAssignmentApiService();

  return useQuery({
    queryKey: assignmentKeys.detail(id),
    queryFn: () => service.getAssignmentById(id),
    staleTime: 60 * 1000, // 1 minute
    enabled: !!id, // Only fetch if ID is provided
  });
};

/**
 * Hook to create a new assignment
 * Automatically invalidates assignment lists after successful creation
 * @returns Mutation function and state
 */
export const useCreateAssignment = () => {
  const queryClient = useQueryClient();
  const service = getAssignmentApiService();

  return useMutation({
    mutationFn: (data: CreateAssignmentRequest) => service.createAssignment(data),
    onSuccess: () => {
      // Invalidate all assignment lists to refetch with new data
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
    },
  });
};

/**
 * Hook to update an existing assignment
 * Automatically invalidates related queries after successful update
 * @returns Mutation function and state
 */
export const useUpdateAssignment = () => {
  const queryClient = useQueryClient();
  const service = getAssignmentApiService();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAssignmentRequest }) =>
      service.updateAssignment(id, data),
    onSuccess: (_, variables) => {
      // Invalidate both the specific assignment and all lists
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: assignmentKeys.detail(variables.id),
      });
    },
  });
};

/**
 * Hook to delete an assignment
 * Automatically invalidates assignment lists after successful deletion
 * @returns Mutation function and state
 */
export const useDeleteAssignment = () => {
  const queryClient = useQueryClient();
  const service = getAssignmentApiService();

  return useMutation({
    mutationFn: (id: string) => service.deleteAssignment(id),
    onSuccess: () => {
      // Invalidate all assignment lists
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
    },
  });
};

/**
 * Hook to generate an assessment matrix using AI
 * @returns Mutation function and state
 */
export const useGenerateMatrix = () => {
  const service = getAssignmentApiService();

  return useMutation({
    mutationFn: (request: GenerateMatrixRequest) => service.generateMatrix(request),
  });
};
