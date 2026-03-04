import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTeacherSystemPromptService } from '../api/teacherSystemPromptService';
import type { TeacherSystemPromptRequest } from '../api/teacherSystemPromptService';

const QUERY_KEY = ['teacherSystemPrompt'];

export const useTeacherSystemPrompt = () => {
  const service = useTeacherSystemPromptService();
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => service.getMyPrompt(),
    retry: (failureCount, error: unknown) => {
      // Don't retry on 404 (no prompt saved yet)
      if ((error as { response?: { status?: number } })?.response?.status === 404) return false;
      return failureCount < 2;
    },
  });
};

export const useUpsertTeacherSystemPrompt = () => {
  const service = useTeacherSystemPromptService();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TeacherSystemPromptRequest) => service.upsertMyPrompt(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(QUERY_KEY, updated);
    },
  });
};

export const useDeleteTeacherSystemPrompt = () => {
  const service = useTeacherSystemPromptService();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => service.deleteMyPrompt(),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: QUERY_KEY });
    },
  });
};
