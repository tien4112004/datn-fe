import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getExamplePromptsApiService } from '../api';
import type { ExamplePromptContent, ExamplePromptType } from '../types/examplePrompt';

export const useExamplePrompts = (type: ExamplePromptType) => {
  const { i18n } = useTranslation();
  const apiService = getExamplePromptsApiService();

  return useQuery<ExamplePromptContent[]>({
    queryKey: ['example-prompts', type, i18n.language],
    queryFn: async () => {
      // i18n.language might be 'en-US', 'vi-VN', or just 'en', 'vi'.
      // Backend expects 'en' or 'vi'.
      // Let's take the first 2 chars.
      const language = i18n.language?.substring(0, 2) || 'vi';
      const data = await apiService.getExamplePrompts(type, language);
      return data;
    },
    // Keep data fresh for 5 minutes as these don't change often
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
