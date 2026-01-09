import { CriticalError } from '@aiprimary/api';
import { getMindmapApiService } from '../api';
import type { Mindmap } from '../types';

/**
 * Loader for mindmap embed pages.
 * Uses the standard mindmap API endpoint.
 *
 * Used by: /mindmap/embed/:id route (public route for webview embedding)
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

  const ourStorage =window.localStorage;
  console.info(`[EMBED] getPublicMindmapById ${ourStorage.getItem('access_token')}`);

  const mindmap = await mindmapApiService.getMindmapById(params.id);

  if (!mindmap) {
    throw new CriticalError('Mindmap not found');
  }

  return { mindmap };
};
