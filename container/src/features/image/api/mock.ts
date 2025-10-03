import { API_MODE, type ApiMode } from '@/shared/constants';
import {
  type ImageApiService,
  type ImageGenerationRequest,
  type ImageGenerationResponse,
  type ImageData,
} from '../types/service';

/**
 * Mock image data for testing
 */
const mockImages: ImageData[] = [
  {
    id: 'img-1',
    url: 'https://picsum.photos/800/600?random=1',
    prompt: 'A beautiful sunset over the mountains',
    style: 'realistic',
    size: '800x600',
    quality: 'high',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'img-2',
    url: 'https://picsum.photos/800/600?random=2',
    prompt: 'A cyberpunk cityscape at night',
    style: 'digital-art',
    size: '800x600',
    quality: 'high',
    createdAt: '2024-01-15T11:00:00Z',
    updatedAt: '2024-01-15T11:00:00Z',
  },
  {
    id: 'img-3',
    url: 'https://picsum.photos/800/600?random=3',
    prompt: 'A peaceful forest with morning mist',
    style: 'artistic',
    size: '800x600',
    quality: 'medium',
    createdAt: '2024-01-15T12:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
  },
];

let mockImageStore: ImageData[] = [...mockImages];

export default class ImageMockService implements ImageApiService {
  baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  getType(): ApiMode {
    return API_MODE.mock;
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newImage: ImageData = {
          id: crypto.randomUUID(),
          url: `https://picsum.photos/800/600?random=${Date.now()}`,
          prompt: request.prompt,
          style: request.style || 'realistic',
          size: request.size || '800x600',
          quality: request.quality || 'high',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Add to mock store
        mockImageStore = [newImage, ...mockImageStore];

        const response: ImageGenerationResponse = {
          images: [newImage],
        };

        resolve(response);
      }, 2000); // Simulate API delay for image generation
    });
  }

  async getImageById(id: string): Promise<ImageData | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const image = mockImageStore.find((img) => img.id === id) || null;
        resolve(image);
      }, 500);
    });
  }

  async generatePresentationImage(
    _id: string,
    _slideId: string,
    _elementId: string,
    _request: ImageGenerationRequest
  ): Promise<ImageGenerationResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Return a mock image URL
        const response: ImageGenerationResponse = {
          images: [
            {
              id: crypto.randomUUID(),
              url: `https://picsum.photos/800/600?random=${Date.now()}`,
            },
          ],
        };
        resolve(response);
      }, 10000);
    });
  }
}
