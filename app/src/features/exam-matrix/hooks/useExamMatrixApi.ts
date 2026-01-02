import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useExamMatrixApiService } from '../api';
import type { ExamMatrixFilters, SubjectCode } from '@/features/exam-matrix/types';
import type {
  CreateExamMatrixRequest,
  UpdateExamMatrixRequest,
  ValidateMatrixRequest,
  CreateTopicRequest,
  UpdateTopicRequest,
} from '@/features/exam-matrix/types/service';

// Export the API service hook for direct use
export { useExamMatrixApiService } from '../api';

// Query key factory
export const examMatrixKeys = {
  all: ['exam-matrix'] as const,
  lists: () => [...examMatrixKeys.all, 'list'] as const,
  list: (filters: ExamMatrixFilters) => [...examMatrixKeys.lists(), filters] as const,
  details: () => [...examMatrixKeys.all, 'detail'] as const,
  detail: (id: string) => [...examMatrixKeys.details(), id] as const,
  topics: () => [...examMatrixKeys.all, 'topics'] as const,
  topicsBySubject: (subjectCode: SubjectCode) => [...examMatrixKeys.topics(), subjectCode] as const,
  validation: (matrixId: string) => [...examMatrixKeys.all, 'validation', matrixId] as const,
};

// GET all exam matrices with filters
export const useExamMatrixList = (filters: ExamMatrixFilters = {}) => {
  const apiService = useExamMatrixApiService();

  return useQuery({
    queryKey: examMatrixKeys.list(filters),
    queryFn: () => apiService.getMatrices(filters),
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
  });
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
      queryClient.invalidateQueries({ queryKey: examMatrixKeys.lists() });
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
      queryClient.invalidateQueries({ queryKey: examMatrixKeys.lists() });
      queryClient.invalidateQueries({ queryKey: examMatrixKeys.detail(result.id) });
    },
  });
};

// DELETE single exam matrix
export const useDeleteMatrix = () => {
  const queryClient = useQueryClient();
  const apiService = useExamMatrixApiService();

  return useMutation({
    mutationFn: (id: string) => apiService.deleteMatrix(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examMatrixKeys.lists() });
    },
  });
};

// DELETE multiple exam matrices
export const useDeleteMatrices = () => {
  const queryClient = useQueryClient();
  const apiService = useExamMatrixApiService();

  return useMutation({
    mutationFn: (ids: string[]) => apiService.deleteMatrices(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examMatrixKeys.lists() });
    },
  });
};

// DUPLICATE exam matrix
export const useDuplicateMatrix = () => {
  const queryClient = useQueryClient();
  const apiService = useExamMatrixApiService();

  return useMutation({
    mutationFn: (id: string) => apiService.duplicateMatrix(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examMatrixKeys.lists() });
    },
  });
};

// VALIDATE matrix compliance
export const useValidateMatrix = () => {
  const apiService = useExamMatrixApiService();

  return useMutation({
    mutationFn: (data: ValidateMatrixRequest) => apiService.validateMatrix(data),
  });
};

// EXPORT exam matrices
export const useExportMatrices = () => {
  const apiService = useExamMatrixApiService();

  return useMutation({
    mutationFn: (filters?: ExamMatrixFilters) => apiService.exportMatrices(filters),
  });
};

// IMPORT exam matrices
export const useImportMatrices = () => {
  const queryClient = useQueryClient();
  const apiService = useExamMatrixApiService();

  return useMutation({
    mutationFn: (file: File) => apiService.importMatrices(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examMatrixKeys.lists() });
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
