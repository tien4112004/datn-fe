import { api, type ApiClient, getBackendUrl } from '@aiprimary/api';
import { MediaService } from './service';

// Response type for uploaded media
export interface UploadedMediaResponse {
  cdnUrl: string;
  mediaType: string;
  extension: string;
  id: number;
}

export interface IMediaApi {
  uploadImage(file: File): Promise<UploadedMediaResponse>;
}

/**
 * Get a media API service instance
 */
export const getMediaApi = (apiClient: ApiClient = api): IMediaApi => {
  return new MediaService(apiClient, getBackendUrl());
};
