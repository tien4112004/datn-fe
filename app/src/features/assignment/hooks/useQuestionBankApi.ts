import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useQuestionBankApiService } from '../api/questionBank.index';
import type {
  QuestionBankFilters,
  CreateQuestionRequest,
  UpdateQuestionRequest,
} from '../types/questionBank';

// Export the API service hook for direct use
export { useQuestionBankApiService } from '../api/questionBank.index';

// Query key factory
export const questionBankKeys = {
  all: ['question-bank'] as const,
  lists: () => [...questionBankKeys.all, 'list'] as const,
  list: (filters: QuestionBankFilters) => [...questionBankKeys.lists(), filters] as const,
  details: () => [...questionBankKeys.all, 'detail'] as const,
  detail: (id: string) => [...questionBankKeys.details(), id] as const,
};

// GET all questions with filters
export const useQuestionBankList = (filters: QuestionBankFilters = {}) => {
  const apiService = useQuestionBankApiService();

  return useQuery({
    queryKey: questionBankKeys.list(filters),
    queryFn: () => apiService.getQuestions(filters),
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
  });
};

// GET single question by ID
export const useQuestionBankItem = (id: string) => {
  const apiService = useQuestionBankApiService();

  return useQuery({
    queryKey: questionBankKeys.detail(id),
    queryFn: () => apiService.getQuestionById(id),
    enabled: !!id,
  });
};

// CREATE question
export const useCreateQuestion = () => {
  const queryClient = useQueryClient();
  const apiService = useQuestionBankApiService();

  return useMutation({
    mutationFn: (data: CreateQuestionRequest) => apiService.createQuestion(data.question),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionBankKeys.lists() });
    },
  });
};

// UPDATE question
export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();
  const apiService = useQuestionBankApiService();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateQuestionRequest }) =>
      apiService.updateQuestion(id, data.question),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: questionBankKeys.lists() });
      queryClient.invalidateQueries({ queryKey: questionBankKeys.detail(result.id) });
    },
  });
};

// DELETE single question
export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();
  const apiService = useQuestionBankApiService();

  return useMutation({
    mutationFn: (id: string) => apiService.deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionBankKeys.lists() });
    },
  });
};

// DELETE multiple questions
export const useDeleteQuestions = () => {
  const queryClient = useQueryClient();
  const apiService = useQuestionBankApiService();

  return useMutation({
    mutationFn: (ids: string[]) => apiService.bulkDeleteQuestions(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionBankKeys.lists() });
    },
  });
};

// DUPLICATE question
export const useDuplicateQuestion = () => {
  const queryClient = useQueryClient();
  const apiService = useQuestionBankApiService();

  return useMutation({
    mutationFn: (id: string) => apiService.duplicateQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionBankKeys.lists() });
    },
  });
};

// COPY question to personal bank
export const useCopyToPersonal = () => {
  const queryClient = useQueryClient();
  const apiService = useQuestionBankApiService();

  return useMutation({
    mutationFn: (id: string) => apiService.copyToPersonal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionBankKeys.lists() });
    },
  });
};

// EXPORT questions
export const useExportQuestions = () => {
  const apiService = useQuestionBankApiService();

  return useMutation({
    mutationFn: (filters?: QuestionBankFilters) => apiService.exportQuestions(filters),
  });
};

// IMPORT questions
export const useImportQuestions = () => {
  const queryClient = useQueryClient();
  const apiService = useQuestionBankApiService();

  return useMutation({
    mutationFn: (file: File) => apiService.importQuestions(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionBankKeys.lists() });
    },
  });
};
