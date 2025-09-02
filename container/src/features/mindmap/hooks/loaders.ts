import { getMindmapApiService } from '../api';

export const getMindmapById = async (mindmapId: string) => {
  const mindmapApiService = getMindmapApiService();
  return await mindmapApiService.getMindmapById(mindmapId);
};
