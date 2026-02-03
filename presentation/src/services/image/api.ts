import { type ApiClient, getBackendUrl, getDefaultApiClient } from '@aiprimary/api';
import { ImageService } from './service';
import type { GeneratedImage, ImageGenerationParams, SingleImageResponse, ImageSearchPayload } from './types';

// Re-export types
export type { GeneratedImage, ImageGenerationParams, SingleImageResponse, ImageSearchPayload };

export interface IImageApi {
  generateImage(
    presentationId: string,
    slideId: string,
    params: ImageGenerationParams
  ): Promise<SingleImageResponse>;
  searchImage(body: ImageSearchPayload): Promise<any>;
  getMyImages(page?: number, pageSize?: number, sort?: 'asc' | 'desc'): Promise<any>;
}

/**
 * Get an image API service instance
 * Automatically detects WebView context and uses appropriate auth method
 */
export const getImageApi = (apiClient: ApiClient = getDefaultApiClient()): IImageApi => {
  return new ImageService(apiClient, getBackendUrl());
};
