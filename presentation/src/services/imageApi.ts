import { getApiServiceFactory } from '@aiprimary/api';
import { ImageApiService } from './image';
import { MockImageApiService } from './image-mock';
import type { GeneratedImage, ImageGenerationParams, ImageGenerationResponse } from './image-types';

// Re-export types
export type { GeneratedImage, ImageGenerationParams, ImageGenerationResponse };

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

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
