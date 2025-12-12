import type { ImageGenerationParams, ImageGenerationResponse } from './types';
import type { ApiService } from '@aiprimary/api';

export class MockImageApiService implements ApiService {
  baseUrl: string;

  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
  }

  getType() {
    return 'mock' as const;
  }

  /**
   * Generate an image for a slide element (mock implementation)
   * Returns a random image URL from picsum.photos after a 2-second delay
   */
  async generateImage(
    presentationId: string,
    slideId: string,
    params: ImageGenerationParams
  ): Promise<ImageGenerationResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          images: [
            {
              url: 'https://picsum.photos/800/600?random=' + Math.floor(Math.random() * 1000),
            },
          ],
        });
      }, 2000); // Simulate 2 seconds delay
    });
  }
}
