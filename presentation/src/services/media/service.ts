import type { ApiClient, ApiResponse } from '@aiprimary/api';
import type { UploadedMediaResponse } from './api';

export class MediaService {
  constructor(
    private readonly apiClient: ApiClient,
    private readonly baseUrl: string
  ) {}

  /**
   * Upload an image file to the server
   * @param file Image file to upload
   * @returns Upload response with CDN URL
   */
  async uploadImage(file: File): Promise<UploadedMediaResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.apiClient.post<ApiResponse<UploadedMediaResponse>>(
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
