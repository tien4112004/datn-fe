import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
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
  metadata: {
    chapters: (subject: string, grade: string) =>
      ['question-bank', 'metadata', 'chapters', subject, grade] as const,
  },
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
      toast.success('Question created successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to create question';
      toast.error(message);
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
      toast.success('Question updated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update question';
      toast.error(message);
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
      toast.success('Question deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to delete question';
      toast.error(message);
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
      toast.success('Questions deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to delete questions';
      toast.error(message);
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
      toast.success('Question duplicated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to duplicate question';
      toast.error(message);
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
      toast.success('Question copied to personal bank successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to copy question to personal bank';
      toast.error(message);
    },
  });
};

// EXPORT questions
export const useExportQuestions = () => {
  const apiService = useQuestionBankApiService();

  return useMutation({
    mutationFn: (filters?: QuestionBankFilters) => apiService.exportQuestions(filters),
    onSuccess: () => {
      toast.success('Questions exported successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to export questions';
      toast.error(message);
    },
  });
};

// IMPORT questions
export const useImportQuestions = () => {
  const queryClient = useQueryClient();
  const apiService = useQuestionBankApiService();

  return useMutation({
    mutationFn: (file: File) => apiService.importQuestions(file),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: questionBankKeys.lists() });
      toast.success(`Successfully imported ${result.success} questions`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to import questions';
      toast.error(message);
    },
  });
};

// ============= QUESTION BANK METADATA =============

// GET chapters for a subject and grade
export const useQuestionBankChapters = (subject?: string, grade?: string) => {
  const apiService = useQuestionBankApiService();

  return useQuery({
    queryKey: questionBankKeys.metadata.chapters(subject || '', grade || ''),
    queryFn: () => apiService.getChapters(subject!, grade!),
    enabled: !!subject && !!grade,
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
  });
};
