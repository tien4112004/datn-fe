import { useQuery } from '@tanstack/react-query';
import { usePresentationApiService } from '../api';
// import type { OutlineItem } from '../types/outline';

export const usePresentationOutlines = () => {
  const presentationApiService = usePresentationApiService();
  const {
    data: outlineItems = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [presentationApiService.getType(), 'presentationItems'],
    queryFn: async () => {
      const data = await presentationApiService.getPresentationItems();
      console.log('Fetch data', data);
      return data;
    },
  });

  return {
    outlineItems,
    isLoading,
    error,
    refetch,
  };
};
