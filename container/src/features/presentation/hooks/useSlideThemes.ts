import { useQuery } from '@tanstack/react-query';
import { usePresentationApiService } from '../api';
import type { SlideTheme } from '../types/slide';

export const useSlideThemes = () => {
  const apiService = usePresentationApiService();

  const { data: themes, ...query } = useQuery<SlideTheme[]>({
    queryKey: [apiService.getType(), 'slideThemes'],
    queryFn: async () => apiService.getSlideThemes(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    themes: themes || [],
    defaultTheme: themes?.find((t) => t.id === 'default') || themes?.[0],
    ...query,
  };
};
