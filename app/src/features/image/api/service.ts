import { API_MODE, type ApiMode } from '@aiprimary/api';
import {
  type ImageApiService,
  type ImageGenerationRequest,
  type ImageGenerationResponse,
  type ImageData,
  type GetImagesParams,
  type ArtStyleApiResponse,
  type GetArtStylesParams,
} from '../types/service';
import { api } from '@aiprimary/api';
import { type ApiResponse } from '@aiprimary/api';

export default class ImageRealApiService implements ImageApiService {
  baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  getType(): ApiMode {
    return API_MODE.real;
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const response = await api.post<ApiResponse<ImageGenerationResponse>>(
      `${this.baseUrl}/api/images/generate`,
      request
    );
    return this._mapImageResponse(response.data.data);
  }

  async getImageById(id: string): Promise<ImageData | null> {
    try {
      const response = await api.get<ApiResponse<ImageData>>(`${this.baseUrl}/api/images/${id}`);
      return this._mapImageItem(response.data.data);
    } catch (error) {
      console.error('Failed to fetch image:', error);
      return null;
    }
  }

  async getImages(params?: GetImagesParams): Promise<ImageData[]> {
    try {
      const response = await api.get<ApiResponse<ImageData[]>>(`${this.baseUrl}/api/images`, {
        params: {
          page: params?.page,
          pageSize: params?.pageSize,
          search: params?.search,
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
    const res = await api.post<ApiResponse<{ cdnUrls: string[] }>>(
      `${this.baseUrl}/api/images/generate-in-presentation`,
      {
        prompt: request.prompt,
        model: request.model.name,
        provider: request.model.provider.toLowerCase(),
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

  async getArtStyles(params?: GetArtStylesParams): Promise<ArtStyleApiResponse[]> {
    try {
      const response = await api.get<ApiResponse<ArtStyleApiResponse[]>>(`${this.baseUrl}/api/art-styles`, {
        params: {
          page: params?.page || 1,
          pageSize: params?.pageSize || 50,
        },
      });

      // Filter only enabled styles (if isEnabled field exists, otherwise return all)
      const styles = response.data.data;
      return styles.filter((style) => style.isEnabled !== false);
    } catch (error) {
      console.error('Failed to fetch art styles:', error);
      return [];
    }
  }
}
