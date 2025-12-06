import { useQuery } from '@tanstack/react-query';
import { usePresentationApiService } from '../api';
import type { SlideTemplate } from '../types/slide';

export const useSlideTemplates = () => {
  const apiService = usePresentationApiService();

  const { data: templates, ...query } = useQuery<SlideTemplate[]>({
    queryKey: [apiService.getType(), 'slideTemplates'],
    queryFn: async () => apiService.getSlideTemplates(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    templates: templates || [],
    ...query,
  };
};
