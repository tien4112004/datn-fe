import { getApiServiceFactory } from '@aiprimary/api';
import { ImageApiService } from './image';
import { MockImageApiService } from './image-mock';
import type { GeneratedImage, ImageGenerationParams, ImageGenerationResponse } from './types';
import { getBackendUrl } from '@aiprimary/api';

// Re-export types
export type { GeneratedImage, ImageGenerationParams, ImageGenerationResponse };

const BASE_URL = getBackendUrl();

export interface IImageApi {
  generateImage(
    presentationId: string,
    slideId: string,
    params: ImageGenerationParams
  ): Promise<ImageGenerationResponse>;
}

/**
 * Get an image API service instance based on current API mode
 * Used with traditional JavaScript (non-reactive)
 */
export const getImageApi = (): IImageApi => {
  return getApiServiceFactory<any>(MockImageApiService, ImageApiService, BASE_URL);
};
