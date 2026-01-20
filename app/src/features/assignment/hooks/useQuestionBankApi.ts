import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useQuestionBankApiService } from '../api/questionBank.index';
import { getAllSubjects, getElementaryGrades } from '@aiprimary/core';
import type {
  QuestionBankFilters,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  QuestionBankItem,
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
    subjects: ['question-bank', 'metadata', 'subjects'] as const,
    grades: ['question-bank', 'metadata', 'grades'] as const,
    chapters: (subject: string, grade: string) =>
      ['question-bank', 'metadata', 'chapters', subject, grade] as const,
  },
};

// GET all questions with filters
export const useQuestionBankList = (filters: QuestionBankFilters) => {
  const apiService = useQuestionBankApiService();

  return useQuery({
    queryKey: questionBankKeys.list(filters),
    queryFn: async () => {
      const response = await apiService.getQuestions(filters);
      return {
        questions: response.data,
        total: response.pagination?.totalItems || 0,
        page: response.pagination?.currentPage || 1,
        limit: response.pagination?.pageSize || 10,
      };
    },
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

// CREATE multiple questions
export const useCreateQuestions = () => {
  const queryClient = useQueryClient();
  const apiService = useQuestionBankApiService();

  return useMutation({
    mutationFn: (questions: Array<Omit<QuestionBankItem, 'id' | 'createdAt' | 'updatedAt'>>) =>
      apiService.createQuestions(questions),
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

// ============= QUESTION BANK METADATA =============

// GET all subjects
export const useQuestionBankSubjects = () => {
  return useQuery({
    queryKey: questionBankKeys.metadata.subjects,
    queryFn: () => getAllSubjects().map((s) => s.code),
    staleTime: Infinity, // Static data, never stale
    gcTime: Infinity,
  });
};

// GET all grades
export const useQuestionBankGrades = () => {
  return useQuery({
    queryKey: questionBankKeys.metadata.grades,
    queryFn: () => getElementaryGrades().map((g) => g.code),
    staleTime: Infinity, // Static data, never stale
    gcTime: Infinity,
  });
};

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
