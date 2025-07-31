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
    isFetching,
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
    isFetching,
  };
};

export const usePresentations = () => {
  const presentationApiService = usePresentationApiService();

  const {
    data: presentationItems,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [presentationApiService.getType(), 'presentations'],
    queryFn: async () => {
      const data = await presentationApiService.getPresentationItems();
      console.log('Fetch presentations', data);
      return data;
    },
  });

  return {
    presentationItems,
    isLoading,
    error,
    refetch,
  };
};
