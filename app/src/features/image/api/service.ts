import type { ApiClient, ApiResponse } from '@aiprimary/api';
import {
  type ImageApiService,
  type ImageGenerationRequest,
  type ImageGenerationResponse,
  type ImageData,
  type GetImagesParams,
  type GetArtStylesParams,
} from '../types/service';
import type { ArtStyle } from '@aiprimary/core';

export default class ImageService implements ImageApiService {
  private readonly apiClient: ApiClient;
  private readonly baseUrl: string;

  constructor(apiClient: ApiClient, baseUrl: string) {
    this.apiClient = apiClient;
    this.baseUrl = baseUrl;
  }

  getType() {
    return 'real' as const;
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const isMock = request.model === 'mock';
    const endpoint = isMock
      ? `${this.baseUrl}/api/image/generate/mock`
      : `${this.baseUrl}/api/images/generate`;

    const response = await this.apiClient.post<ApiResponse<ImageGenerationResponse>>(endpoint, request);
    return this._mapImageResponse(response.data.data);
  }

  async getImageById(id: string): Promise<ImageData | null> {
    try {
      const response = await this.apiClient.get<ApiResponse<ImageData>>(`${this.baseUrl}/api/images/${id}`);
      return this._mapImageItem(response.data.data);
    } catch (error) {
      console.error('Failed to fetch image:', error);
      return null;
    }
  }

  async getImages(params?: GetImagesParams): Promise<ImageData[]> {
    try {
      const response = await this.apiClient.get<ApiResponse<ImageData[]>>(`${this.baseUrl}/api/images`, {
        params: {
          page: params?.page,
          pageSize: params?.pageSize,
          search: params?.search,
          sort: params?.sort,
        },
      });
      return response.data.data.map((img) => this._mapImageItem(img));
    } catch (error) {
      console.error('Failed to fetch images:', error);
      return [];
    }
  }

  async generatePresentationImage(
    id: string,
    slideId: string,
    elementId: string,
    request: ImageGenerationRequest
  ): Promise<ImageGenerationResponse> {
    const isMock = request.model === 'mock';
    const endpoint = isMock
      ? `${this.baseUrl}/api/image/generate-in-presentation/mock`
      : `${this.baseUrl}/api/images/generate-in-presentation`;

    const res = await this.apiClient.post<ApiResponse<{ cdnUrls: string[] }>>(
      endpoint,
      {
        prompt: request.prompt,
        model: request.model,
        provider: request.provider.toLowerCase(),
        themeStyle: request.themeStyle,
        themeDescription: request.themeDescription,
        artStyle: request.artStyle,
        artDescription: request.artDescription,
      },
      {
        headers: {
          'Idempotency-Key': `${id}:${slideId}:${elementId}`,
        },
      }
    );

    return this._mapImageResponse(res.data.data);
  }

  private _mapImageItem(data: any): ImageData {
    return {
      id: data.id,
      url: data.url || data.cdnUrl,
      prompt: data.prompt,
      style: data.style,
      size: data.size,
      quality: data.quality,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  private _mapImageResponse(data: any): ImageGenerationResponse {
    return {
      images: data.images.map((img: any) => this._mapImageItem(img)),
    };
  }

  async getArtStyles(params?: GetArtStylesParams): Promise<ArtStyle[]> {
    try {
      const response = await this.apiClient.get<ApiResponse<any[]>>(`${this.baseUrl}/api/art-styles`, {
        params: {
          page: params?.page || 1,
          pageSize: params?.pageSize || 50,
        },
      });

      // Filter only enabled styles and map to ArtStyle interface
      const styles = response.data.data;
      return styles
        .filter((style) => style.isEnabled !== false)
        .map((style) => ({
          id: style.id,
          name: style.name,
          labelKey: style.labelKey,
          visual: style.visual || undefined,
          modifiers: style.modifiers || undefined,
          createdAt: style.createdAt,
          updatedAt: style.updatedAt,
        }));
    } catch (error) {
      console.error('Failed to fetch art styles:', error);
      return [];
    }
  }

  async uploadImage(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await this.apiClient.post<
        ApiResponse<{ cdnUrl: string; mediaType: string; extension: string; id: number }>
      >(`${this.baseUrl}/api/media/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.data.cdnUrl;
    } catch (error) {
      console.error('Failed to upload image:', error);
      throw new Error('Failed to upload image');
    }
  }
}
