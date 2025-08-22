import { useMindmapApiService } from '../api';

export const getMindmapById = async (mindmapId: string) => {
  const mindmapApiService = useMindmapApiService(true);
  return await mindmapApiService.getMindmapById(mindmapId);
};
