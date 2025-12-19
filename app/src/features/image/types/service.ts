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
  //   url: string;
  //   prompt: string;
  //   style?: string;
  //   size?: string;
  //   quality?: string;
  //   createdAt: string;
  images: ImageData[];
}

export interface ImageData {
  id: string;
  url: string;
  prompt?: string;
  style?: string;
  size?: string;
  quality?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetImagesParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

// API Response Types for Art Styles
export interface ArtStyleApiResponse {
  id: string;
  name: string;
  labelKey: string;
  visual: string | null;
  modifiers: string | null;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  data: object | null;
}

export interface GetArtStylesParams {
  page?: number;
  pageSize?: number;
}

export interface ImageApiService extends Service {
  generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse>;
  getImageById(id: string): Promise<ImageData | null>;
  getImages(params?: GetImagesParams): Promise<ImageData[]>;
  generatePresentationImage(
    id: string,
    slideId: string,
    elementId: string,
    request: ImageGenerationRequest
  ): Promise<ImageGenerationResponse>;
  getArtStyles(params?: GetArtStylesParams): Promise<ArtStyleApiResponse[]>;
}
