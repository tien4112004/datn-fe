import { useQuery } from '@tanstack/react-query';
import { usePresentationApiService } from '../api';

export const usePresentationOutlines = () => {
  const presentationApiService = usePresentationApiService();
  const { data: outlineItems = [], ...query } = useQuery({
    queryKey: [presentationApiService.getType(), 'presentationItems'],
    queryFn: async () => {
      const data = await presentationApiService.getOutlineItems();
      console.log('Fetch data', data);
      return data;
    },
  });

  return {
    outlineItems,
    ...query,
  };
};

export const usePresentations = () => {
  const presentationApiService = usePresentationApiService();

  const { data: presentationItems, ...query } = useQuery({
    queryKey: [presentationApiService.getType(), 'presentations'],
    queryFn: async () => {
      const data = await presentationApiService.getPresentationItems();
      console.log('Fetch presentations', data);
      return data;
    },
  }); 

  return {
    presentationItems,
    ...query,
  };
};
