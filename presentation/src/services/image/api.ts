import { api, type ApiClient, getBackendUrl } from '@aiprimary/api';
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
 */
export const getImageApi = (apiClient: ApiClient = api): IImageApi => {
  return new ImageService(apiClient, getBackendUrl());
};
