import { api } from '@aiprimary/api';
import type { ApiResponse } from '@aiprimary/api';
import type { ImageGenerationParams, ImageGenerationResponse } from './types';
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
  ): Promise<ImageGenerationResponse> {
    const response = await api.post<ApiResponse<ImageGenerationResponse>>(
      `${this.baseUrl}/api/images/generate-in-presentation`,
      {
        prompt: params.prompt,
        model: params.model.name,
        provider: params.model.provider.toLowerCase(),
      },
      {
        headers: {
          'Idempotency-Key': `${presentationId}:${slideId}:image`,
        },
      }
    );
    return response.data.data;
  }
}
