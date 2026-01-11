import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentApi, assignmentKeys } from '../api/assignmentApi';
import type { CreateAssignmentRequest, UpdateAssignmentRequest } from '../types';

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
  return useQuery({
    queryKey: assignmentKeys.list(filters),
    queryFn: () => assignmentApi.getAssignments(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Hook to fetch a single assignment by ID
 * @param id - Assignment ID
 * @returns Query result with assignment details
 */
export const useAssignment = (id: string) => {
  return useQuery({
    queryKey: assignmentKeys.detail(id),
    queryFn: () => assignmentApi.getAssignment(id),
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

  return useMutation({
    mutationFn: (data: CreateAssignmentRequest) => assignmentApi.createAssignment(data),
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

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAssignmentRequest }) =>
      assignmentApi.updateAssignment(id, data),
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

  return useMutation({
    mutationFn: (id: string) => assignmentApi.deleteAssignment(id),
    onSuccess: () => {
      // Invalidate all assignment lists
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
    },
  });
};

/**
 * Hook to publish an assignment
 * Changes status from draft to published
 * Automatically invalidates related queries after successful publish
 * @returns Mutation function and state
 */
export const usePublishAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => assignmentApi.publishAssignment(id),
    onSuccess: (_, id) => {
      // Invalidate both the specific assignment and all lists
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: assignmentKeys.detail(id) });
    },
  });
};

/**
 * Hook to archive an assignment
 * Changes status to archived
 * Automatically invalidates related queries after successful archive
 * @returns Mutation function and state
 */
export const useArchiveAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => assignmentApi.archiveAssignment(id),
    onSuccess: (_, id) => {
      // Invalidate both the specific assignment and all lists
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: assignmentKeys.detail(id) });
    },
  });
};
