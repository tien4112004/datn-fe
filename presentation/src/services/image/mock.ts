import type { ImageGenerationParams, ImageGenerationResponse, ImageSearchPayload } from './types';
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

  async searchImage(body: ImageSearchPayload): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock image search results
        resolve({
          data: {
            results: Array.from({ length: 10 }, (_, i) => ({
              id: i + 1,
              url: `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}`,
              thumbnail: `https://picsum.photos/200/150?random=${Math.floor(Math.random() * 1000)}`,
              photographer: 'Mock Photographer',
              alt: body.query,
            })),
            total: 100,
            page: body.page || 1,
            per_page: body.per_page || 15,
          },
        });
      }, 500);
    });
  }

  async getMyImages(page: number = 1, size: number = 20): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock user images
        resolve({
          data: {
            content: Array.from({ length: size }, (_, i) => ({
              id: (page - 1) * size + i + 1,
              url: `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}`,
              thumbnail: `https://picsum.photos/200/150?random=${Math.floor(Math.random() * 1000)}`,
              name: `My Image ${(page - 1) * size + i + 1}`,
              createdAt: new Date().toISOString(),
            })),
            totalElements: 100,
            totalPages: Math.ceil(100 / size),
            currentPage: page,
            size,
          },
        });
      }, 500);
    });
  }
}
