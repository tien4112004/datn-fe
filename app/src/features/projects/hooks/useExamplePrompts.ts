import { useQuery } from '@tanstack/react-query';
import { getExamplePromptsApiService } from '../api';
import type { ExamplePromptContent, ExamplePromptType } from '../types/examplePrompt';

export const useExamplePrompts = (type: ExamplePromptType) => {
  const apiService = getExamplePromptsApiService();

  return useQuery<ExamplePromptContent[]>({
    queryKey: ['example-prompts', type],
    queryFn: async () => {
      const data = await apiService.getExamplePrompts(type);
      return data;
    },
    // Keep data fresh for 5 minutes as these don't change often
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
