import { useQuery } from '@tanstack/react-query';
import { useDemoApiService } from '../api';

export const useApi = () => {
  const demoApiService = useDemoApiService();

  const {
    data: demoItems,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [demoApiService.getType(), 'demoItems'],
    queryFn: async () => {
      const data = await demoApiService.getDemoItems();
      console.log('Fetch data', demoItems);
      return data;
    },
  });

  return {
    demoItems,
    isLoading,
    error,
    refetch,
  };
};
