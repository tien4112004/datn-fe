import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAssessmentMatrixApiService } from '../api';
import type { SubjectCode } from '@/features/assessment-matrix/types';
import type {
  CreateAssessmentMatrixRequest,
  UpdateAssessmentMatrixRequest,
  CreateTopicRequest,
  UpdateTopicRequest,
} from '@/features/assessment-matrix/types/service';

// Export the API service hook for direct use
export { useAssessmentMatrixApiService } from '../api';

// Query key factory
export const assessmentMatrixKeys = {
  all: ['assessment-matrix'] as const,
  details: () => [...assessmentMatrixKeys.all, 'detail'] as const,
  detail: (id: string) => [...assessmentMatrixKeys.details(), id] as const,
  topics: () => [...assessmentMatrixKeys.all, 'topics'] as const,
  topicsBySubject: (subjectCode: SubjectCode) => [...assessmentMatrixKeys.topics(), subjectCode] as const,
};

// GET single exam matrix by ID
export const useAssessmentMatrix = (id: string) => {
  const apiService = useAssessmentMatrixApiService();

  return useQuery({
    queryKey: assessmentMatrixKeys.detail(id),
    queryFn: () => apiService.getMatrixById(id),
    enabled: !!id,
  });
};

// CREATE exam matrix
export const useCreateMatrix = () => {
  const queryClient = useQueryClient();
  const apiService = useAssessmentMatrixApiService();

  return useMutation({
    mutationFn: (data: CreateAssessmentMatrixRequest) => apiService.createMatrix(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assessmentMatrixKeys.details() });
    },
  });
};

// UPDATE exam matrix
export const useUpdateMatrix = () => {
  const queryClient = useQueryClient();
  const apiService = useAssessmentMatrixApiService();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAssessmentMatrixRequest }) =>
      apiService.updateMatrix(id, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: assessmentMatrixKeys.detail(result.id) });
    },
  });
};

// GET topics by subject
export const useTopicsBySubject = (subjectCode: SubjectCode) => {
  const apiService = useAssessmentMatrixApiService();

  return useQuery({
    queryKey: assessmentMatrixKeys.topicsBySubject(subjectCode),
    queryFn: () => apiService.getTopicsBySubject(subjectCode),
    enabled: !!subjectCode,
    staleTime: 60000, // 1 minute
  });
};

// CREATE topic
export const useCreateTopic = () => {
  const queryClient = useQueryClient();
  const apiService = useAssessmentMatrixApiService();

  return useMutation({
    mutationFn: (data: CreateTopicRequest) => apiService.createTopic(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assessmentMatrixKeys.topics() });
    },
  });
};

// UPDATE topic
export const useUpdateTopic = () => {
  const queryClient = useQueryClient();
  const apiService = useAssessmentMatrixApiService();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTopicRequest }) => apiService.updateTopic(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assessmentMatrixKeys.topics() });
    },
  });
};

// DELETE topic
export const useDeleteTopic = () => {
  const queryClient = useQueryClient();
  const apiService = useAssessmentMatrixApiService();

  return useMutation({
    mutationFn: (id: string) => apiService.deleteTopic(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assessmentMatrixKeys.topics() });
    },
  });
};
