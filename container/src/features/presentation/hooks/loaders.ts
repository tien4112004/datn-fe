import { CriticalError } from '@/types/errors';
import { getPresentationApiService } from '../api';
import type { Presentation } from '../types';

export const getPresentationById = async ({
  params,
}: {
  params: { id?: string };
}): Promise<{ presentation: Presentation | null }> => {
  if (!params.id) {
    throw new CriticalError('Presentation ID is required');
  }

  const presentationApiService = getPresentationApiService();
  const presentation = await presentationApiService.getPresentationById(params.id);

  return { presentation };
};
