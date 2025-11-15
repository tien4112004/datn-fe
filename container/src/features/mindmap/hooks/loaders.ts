import { CriticalError } from '@/types/errors';
import { getMindmapApiService } from '../api';
import type { MindmapData } from '../types/service';

export const getMindmapById = async ({
  params,
}: {
  params: { id?: string };
}): Promise<{ mindmap: MindmapData }> => {
  if (!params.id) {
    throw new CriticalError('Mindmap ID is required');
  }

  const mindmapApiService = getMindmapApiService();
  const mindmap = await mindmapApiService.getMindmapById(params.id);

  if (!mindmap) {
    throw new CriticalError('Mindmap not found');
  }

  return { mindmap };
};
