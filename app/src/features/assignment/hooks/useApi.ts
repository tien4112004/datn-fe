import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAssignmentApiService } from '../api';
import type {
  AssignmentCollectionRequest,
  CreateAssignmentRequest,
  UpdateAssignmentRequest,
  Submission,
} from '../types';

const assignmentKeys = {
  all: ['assignments'] as const,
  lists: () => [...assignmentKeys.all, 'list'] as const,
  list: (params: AssignmentCollectionRequest) => [...assignmentKeys.lists(), params] as const,
  details: () => [...assignmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...assignmentKeys.details(), id] as const,
};

export const useAssignments = (params: AssignmentCollectionRequest = {}) => {
  const assignmentApiService = useAssignmentApiService();

  return useQuery({
    queryKey: assignmentKeys.list(params),
    queryFn: () => assignmentApiService.getAssignments(params),
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
  });
};

export const useAssignment = (id: string) => {
  const assignmentApiService = useAssignmentApiService();

  return useQuery({
    queryKey: assignmentKeys.detail(id),
    queryFn: () => assignmentApiService.getAssignmentById(id),
    enabled: !!id,
  });
};

export const useCreateAssignment = () => {
  const queryClient = useQueryClient();
  const assignmentApiService = useAssignmentApiService();

  return useMutation({
    mutationFn: (data: CreateAssignmentRequest) => assignmentApiService.createAssignment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
    },
  });
};

export const useUpdateAssignment = () => {
  const queryClient = useQueryClient();
  const assignmentApiService = useAssignmentApiService();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAssignmentRequest }) =>
      assignmentApiService.updateAssignment(id, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: assignmentKeys.detail(result.id) });
    },
  });
};

export const useDeleteAssignment = () => {
  const queryClient = useQueryClient();
  const assignmentApiService = useAssignmentApiService();

  return useMutation({
    mutationFn: (id: string) => assignmentApiService.deleteAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
    },
  });
};

export const useSubmitAssignment = () => {
  const assignmentApiService = useAssignmentApiService();

  return useMutation({
    mutationFn: ({ assignmentId, submission }: { assignmentId: string; submission: Submission }) =>
      assignmentApiService.submitAssignment(assignmentId, submission),
  });
};
