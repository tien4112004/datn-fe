import { getApiServiceFactory } from '@aiprimary/api';
import { ImageApiService } from './service';
import { MockImageApiService } from './mock';
import type { GeneratedImage, ImageGenerationParams, SingleImageResponse, ImageSearchPayload } from './types';
import { getBackendUrl } from '@aiprimary/api';

// Re-export types
export type { GeneratedImage, ImageGenerationParams, SingleImageResponse, ImageSearchPayload };

const BASE_URL = getBackendUrl();

export interface IImageApi {
  generateImage(
    presentationId: string,
    slideId: string,
    params: ImageGenerationParams
  ): Promise<SingleImageResponse>;
  searchImage(body: ImageSearchPayload): Promise<any>;
  getMyImages(page?: number, size?: number): Promise<any>;
}

/**
 * Get an image API service instance based on current API mode
 * Used with traditional JavaScript (non-reactive)
 */
export const getImageApi = (): IImageApi => {
  return getApiServiceFactory<any>(MockImageApiService, ImageApiService, BASE_URL);
};
