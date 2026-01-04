import { CriticalError } from '@aiprimary/api';
import { getMindmapApiService } from '../api';
import type { Mindmap } from '../types';

/**
 * Public loader for mindmap embed pages.
 * Does not require authentication - fetches from public API endpoint.
 *
 * Used by: /mindmap/embed/:id route (public route for Flutter WebView)
 */
export const getPublicMindmapById = async ({
  params,
}: {
  params: { id?: string };
}): Promise<{ mindmap: Mindmap }> => {
  if (!params.id) {
    throw new CriticalError('Mindmap ID is required');
  }

  const mindmapApiService = getMindmapApiService();
  const mindmap = await mindmapApiService.getPublicMindmapById(params.id);

  if (!mindmap) {
    throw new CriticalError('Mindmap not found');
  }

  return { mindmap };
};
