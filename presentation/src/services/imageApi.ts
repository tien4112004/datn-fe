import { api } from '@aiprimary/api';
import type { ApiResponse } from '@aiprimary/api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface GeneratedImage {
  url: string;
  [key: string]: any;
}

export const imageApi = {
  /**
   * Generate an image for a slide element
   * Called when a slide with image placeholder is added during generation
   */
  async generateImage(
    presentationId: string,
    slideId: string,
    elementId: string,
    params: {
      prompt: string;
      model: {
        name: string;
        provider: string;
      };
    }
  ): Promise<{ images: Array<{ url: string }> }> {
    const response = await api.post<ApiResponse<{ images: Array<{ url: string }> }>>(
      `${BASE_URL}/presentations/${presentationId}/slides/${slideId}/elements/${elementId}/generate-image`,
      {
        prompt: params.prompt,
        model: params.model.name,
        provider: params.model.provider.toLowerCase(),
      }
    );
    return response.data.data;
  },
};

export const mockImageApi = {
  async generateImage(
    presentationId: string,
    slideId: string,
    elementId: string,
    params: {
      prompt: string;
      model: {
        name: string;
        provider: string;
      };
    }
  ): Promise<{ images: Array<{ url: string }> }> {
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
  },
};
