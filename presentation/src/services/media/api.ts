import { getApiServiceFactory } from '@aiprimary/api';
import { MediaApiService } from './service';
import { MockMediaApiService } from './mock';
import { getBackendUrl } from '@aiprimary/api';

// Response type for uploaded media
export interface UploadedMediaResponse {
  cdnUrl: string;
  mediaType: string;
  extension: string;
  id: number;
}

const BASE_URL = getBackendUrl();

export interface IMediaApi {
  uploadImage(file: File): Promise<UploadedMediaResponse>;
}

/**
 * Get a media API service instance based on current API mode
 * Used with traditional JavaScript (non-reactive)
 */
export const getMediaApi = (): IMediaApi => {
  return getApiServiceFactory<any>(MockMediaApiService, MediaApiService, BASE_URL);
};
