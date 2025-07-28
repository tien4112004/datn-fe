import { useDemoApiService } from '../api';

export const useApi = () => {
  const demoApiService = useDemoApiService();

  const fetchData = async () => {
    const data = await demoApiService.getDemoItems();
    console.log('Fetched data:', data);
    return data;
  };

  return {
    fetchData,
  };
};
