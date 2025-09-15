import { CriticalError } from '@/types/errors';
import { getPresentationApiService } from '../api';

export const getPresentationById = async ({ params }: { params: { id?: string } }) => {
  if (!params.id) {
    throw new CriticalError('Presentation ID is required');
  }

  const presentationApiService = getPresentationApiService();
  const presentation = await presentationApiService.getPresentationById(params.id);
  if (!presentation) {
    throw new CriticalError('Presentation not found');
  }

  return { presentation };
};
