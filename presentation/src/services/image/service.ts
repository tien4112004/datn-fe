import type { ApiClient, ApiResponse } from '@aiprimary/api';
import type {
  ImageGenerationParams,
  ImageGenerationResponse,
  SingleImageResponse,
  ImageSearchPayload,
} from './types';

export class ImageService {
  constructor(
    private readonly apiClient: ApiClient,
    private readonly baseUrl: string
  ) {}

  /**
   * Generate an image for a slide element
   * Called when a slide with image placeholder is added during generation
   */
  async generateImage(
    presentationId: string,
    slideId: string,
    params: ImageGenerationParams
  ): Promise<SingleImageResponse> {
    const isMock = params.imageModel.name === 'mock';
    const endpoint = isMock
      ? `${this.baseUrl}/api/image/generate-in-presentation/mock`
      : `${this.baseUrl}/api/images/generate-in-presentation`;

    const [response] = await Promise.all([
      this.apiClient.post<ApiResponse<any>>(
        endpoint,
        {
          prompt: params.prompt,
          model: params.imageModel.name,
          provider: params.imageModel.provider.toLowerCase(),
          themeStyle: params.themeStyle,
          themeDescription: params.themeDescription,
          artStyle: params.artStyle,
          artDescription: params.artStyleModifiers,
        },
        {
          headers: {
            'Idempotency-Key': `${presentationId}:${slideId}`,
          },
        }
      ),
      Promise.resolve(isMock ? null : new Promise((resolve) => setTimeout(resolve, 2000))),
    ]);
    return {
      imageUrl: response.data.data.images[0].cdnUrl,
    };
  }

  async searchImage(body: ImageSearchPayload): Promise<any> {
    try {
      const response = await this.apiClient.post(`${this.baseUrl}/api/images/search-pexels`, body);
      return response.data;
    } catch (error: any) {
      // Handle rate limit from Pexels API
      if (error.response?.status === 502) {
        throw new Error('Image search service is temporarily unavailable. Please try again later.');
      }
      throw error;
    }
  }

  async getMyImages(page: number = 1, pageSize: number = 20, sort: 'asc' | 'desc' = 'desc'): Promise<any> {
    try {
      const response = await this.apiClient.get(`${this.baseUrl}/api/images`, {
        params: { page, pageSize, sort },
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }
}
