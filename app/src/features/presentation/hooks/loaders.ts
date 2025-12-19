import { CriticalError } from '@aiprimary/api';
import { ERROR_TYPE } from '@/shared/constants';
import { getPresentationApiService } from '../api';
import type { Presentation } from '../types';

function validatePresentationData(presentation: Presentation, id: string): void {
  // Check required fields
  if (!presentation.id) {
    throw new CriticalError(`Presentation data is corrupted: missing ID`, ERROR_TYPE.VALIDATION);
  }

  // Verify ID matches
  if (presentation.id !== id) {
    throw new CriticalError(
      `Presentation ID mismatch: expected ${id}, got ${presentation.id}`,
      ERROR_TYPE.VALIDATION
    );
  }

  // Check for title (can be empty string but must exist)
  if (presentation.title === undefined || presentation.title === null) {
    throw new CriticalError(`Presentation data is corrupted: missing title`, ERROR_TYPE.VALIDATION);
  }

  // Validate slides if present (slides can be undefined during generation)
  if (presentation.slides !== undefined && presentation.slides !== null) {
    if (!Array.isArray(presentation.slides)) {
      throw new CriticalError(
        `Presentation data is corrupted: slides is not an array`,
        ERROR_TYPE.VALIDATION
      );
    }

    // Check each slide has minimum required structure
    presentation.slides.forEach((slide, index) => {
      if (!slide || typeof slide !== 'object') {
        throw new CriticalError(
          `Presentation data is corrupted: slide at index ${index} is invalid`,
          ERROR_TYPE.VALIDATION
        );
      }

      if (!slide.id) {
        throw new CriticalError(
          `Presentation data is corrupted: slide at index ${index} missing id`,
          ERROR_TYPE.VALIDATION
        );
      }

      if (!slide.elements || !Array.isArray(slide.elements)) {
        throw new CriticalError(
          `Presentation data is corrupted: slide at index ${index} has invalid elements`,
          ERROR_TYPE.VALIDATION
        );
      }
    });
  }
}

export const getPresentationById = async ({
  params,
}: {
  params: { id?: string };
}): Promise<{ presentation: Presentation | null }> => {
  if (!params.id) {
    throw new CriticalError('Presentation ID is required', ERROR_TYPE.RESOURCE_NOT_FOUND);
  }

  const presentationApiService = getPresentationApiService();
  const presentation = await presentationApiService.getPresentationById(params.id);

  // Validate presentation data structure if it exists
  if (presentation) {
    validatePresentationData(presentation, params.id);
  }

  return { presentation };
};
