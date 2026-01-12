import { api } from '@aiprimary/api';
import type { ApiResponse } from '@aiprimary/api';
import type { UploadedMediaResponse } from './api';
import type { ApiService } from '@aiprimary/api';
import { getBackendUrl } from '@aiprimary/api';

const BASE_URL = getBackendUrl();

export class MediaApiService implements ApiService {
  baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  getType() {
    return 'real' as const;
  }

  /**
   * Upload an image file to the server
   * @param file Image file to upload
   * @returns Upload response with CDN URL
   */
  async uploadImage(file: File): Promise<UploadedMediaResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<ApiResponse<UploadedMediaResponse>>(
      `${this.baseUrl}/api/media/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data;
  }
}
