import { api } from '@aiprimary/api';
import type { ApiResponse } from '@aiprimary/api';
import type {
  ImageGenerationParams,
  ImageGenerationResponse,
  SingleImageResponse,
  ImageSearchPayload,
} from './types';
import type { ApiService } from '@aiprimary/api';
import { getBackendUrl } from '@aiprimary/api';

const BASE_URL = getBackendUrl();

export class ImageApiService implements ApiService {
  baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  getType() {
    return 'real' as const;
  }

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
      api.post<ApiResponse<any>>(
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
      const response = await api.post(`${this.baseUrl}/api/images/search-pexels`, body);
      return response.data;
    } catch (error: any) {
      // Handle rate limit from Pexels API
      if (error.response?.status === 502) {
        throw new Error('Image search service is temporarily unavailable. Please try again later.');
      }
      throw error;
    }
  }

  async getMyImages(page: number = 1, size: number = 20): Promise<any> {
    try {
      const response = await api.get(`${this.baseUrl}/api/images`, {
        params: { page, size },
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }
}
