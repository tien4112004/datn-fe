import { CriticalError } from '@aiprimary/api';
import { getMindmapApiService } from '../api';
import type { Mindmap } from '../types';

export const getMindmapById = async ({
  params,
}: {
  params: { id?: string };
}): Promise<{ mindmap: Mindmap }> => {
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
