import type { Service } from '@/shared/api';

export interface ImageGenerationRequest {
  prompt: string;
  style?: string;
  size?: string;
  quality?: string;

  model: {
    name: string;
    provider: string;
  };
}

export interface ImageGenerationResponse {
  //   id: string;
  //   url: string;
  //   prompt: string;
  //   style?: string;
  //   size?: string;
  //   quality?: string;
  //   createdAt: string;
  urls: string[];
}

export interface ImageData {
  id: string;
  url: string;
  prompt: string;
  style?: string;
  size?: string;
  quality?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImageApiService extends Service {
  generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse>;
  getImageById(id: string): Promise<ImageData | null>;
  generatePresentationImage(
    id: string,
    slideId: string,
    elementId: string,
    request: ImageGenerationRequest
  ): Promise<ImageGenerationResponse>;
}
