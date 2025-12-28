import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useExamMatrixApiService } from '../api';
import type { SubjectCode } from '@/features/exam-matrix/types';
import type {
  CreateExamMatrixRequest,
  UpdateExamMatrixRequest,
  CreateTopicRequest,
  UpdateTopicRequest,
} from '@/features/exam-matrix/types/service';

// Export the API service hook for direct use
export { useExamMatrixApiService } from '../api';

// Query key factory
export const examMatrixKeys = {
  all: ['exam-matrix'] as const,
  details: () => [...examMatrixKeys.all, 'detail'] as const,
  detail: (id: string) => [...examMatrixKeys.details(), id] as const,
  topics: () => [...examMatrixKeys.all, 'topics'] as const,
  topicsBySubject: (subjectCode: SubjectCode) => [...examMatrixKeys.topics(), subjectCode] as const,
};

// GET single exam matrix by ID
export const useExamMatrix = (id: string) => {
  const apiService = useExamMatrixApiService();

  return useQuery({
    queryKey: examMatrixKeys.detail(id),
    queryFn: () => apiService.getMatrixById(id),
    enabled: !!id,
  });
};

// CREATE exam matrix
export const useCreateMatrix = () => {
  const queryClient = useQueryClient();
  const apiService = useExamMatrixApiService();

  return useMutation({
    mutationFn: (data: CreateExamMatrixRequest) => apiService.createMatrix(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examMatrixKeys.details() });
    },
  });
};

// UPDATE exam matrix
export const useUpdateMatrix = () => {
  const queryClient = useQueryClient();
  const apiService = useExamMatrixApiService();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExamMatrixRequest }) =>
      apiService.updateMatrix(id, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: examMatrixKeys.detail(result.id) });
    },
  });
};

// GET topics by subject
export const useTopicsBySubject = (subjectCode: SubjectCode) => {
  const apiService = useExamMatrixApiService();

  return useQuery({
    queryKey: examMatrixKeys.topicsBySubject(subjectCode),
    queryFn: () => apiService.getTopicsBySubject(subjectCode),
    enabled: !!subjectCode,
    staleTime: 60000, // 1 minute
  });
};

// CREATE topic
export const useCreateTopic = () => {
  const queryClient = useQueryClient();
  const apiService = useExamMatrixApiService();

  return useMutation({
    mutationFn: (data: CreateTopicRequest) => apiService.createTopic(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examMatrixKeys.topics() });
    },
  });
};

// UPDATE topic
export const useUpdateTopic = () => {
  const queryClient = useQueryClient();
  const apiService = useExamMatrixApiService();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTopicRequest }) => apiService.updateTopic(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examMatrixKeys.topics() });
    },
  });
};

// DELETE topic
export const useDeleteTopic = () => {
  const queryClient = useQueryClient();
  const apiService = useExamMatrixApiService();

  return useMutation({
    mutationFn: (id: string) => apiService.deleteTopic(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examMatrixKeys.topics() });
    },
  });
};
