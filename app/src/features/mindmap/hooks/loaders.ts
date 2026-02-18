import { CriticalError } from '@aiprimary/api';
import { getMindmapApiService } from '../api';
import type { Mindmap } from '../types';

export const getMindmapById = async ({
  params,
  request,
}: {
  params: { id?: string };
  request: Request;
}): Promise<{ mindmap: Mindmap }> => {
  if (!params.id) {
    throw new CriticalError('Mindmap ID is required');
  }

  // Extract token from URL (passed by Flutter for generation mode)
  // and save to localStorage before making API calls
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  if (token) {
    localStorage.setItem('access_token', token);
  }

  const mindmapApiService = getMindmapApiService();
  const mindmap = await mindmapApiService.getMindmapById(params.id);

  if (!mindmap) {
    throw new CriticalError('Mindmap not found');
  }

  return { mindmap };
};
