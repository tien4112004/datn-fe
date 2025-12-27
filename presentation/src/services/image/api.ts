import { getApiServiceFactory } from '@aiprimary/api';
import { ImageApiService } from './service';
import { MockImageApiService } from './mock';
import type { GeneratedImage, ImageGenerationParams, SingleImageResponse } from './types';
import { getBackendUrl } from '@aiprimary/api';

// Re-export types
export type { GeneratedImage, ImageGenerationParams, SingleImageResponse };

const BASE_URL = getBackendUrl();

export interface IImageApi {
  generateImage(
    presentationId: string,
    slideId: string,
    params: ImageGenerationParams
  ): Promise<SingleImageResponse>;
}

/**
 * Get an image API service instance based on current API mode
 * Used with traditional JavaScript (non-reactive)
 */
export const getImageApi = (): IImageApi => {
  return getApiServiceFactory<any>(MockImageApiService, ImageApiService, BASE_URL);
};
