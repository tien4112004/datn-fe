import type { ArtStyle } from '@aiprimary/core';

export interface ImageGenerationRequest {
  prompt: string;
  size?: string;
  model: string;
  provider: string;
  themeStyle?: string;
  themeDescription?: string;
  artStyle?: string;
  artDescription?: string;
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
  sort?: 'asc' | 'desc';
}

export interface GetArtStylesParams {
  page?: number;
  pageSize?: number;
}

export interface ImageApiService {
  getType(): 'real' | 'mock';
  generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse>;
  getImageById(id: string): Promise<ImageData | null>;
  getImages(params?: GetImagesParams): Promise<ImageData[]>;
  generatePresentationImage(
    id: string,
    slideId: string,
    elementId: string,
    request: ImageGenerationRequest
  ): Promise<ImageGenerationResponse>;
  getArtStyles(params?: GetArtStylesParams): Promise<ArtStyle[]>;
  uploadImage(file: File): Promise<string>;
}
