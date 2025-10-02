import { API_MODE, type ApiMode } from '@/shared/constants';
import {
  type ImageApiService,
  type ImageGenerationRequest,
  type ImageGenerationResponse,
  type ImageData,
} from '../types/service';
import { api } from '@/shared/api';
import { type ApiResponse } from '@/types/api';

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

  async generatePresentationImage(
    id: string,
    slideId: string,
    elementId: string,
    request: ImageGenerationRequest
  ): Promise<ImageGenerationResponse> {
    const res = await api.post<ApiResponse<{ cdnUrls: string[] }>>(
      `${this.baseUrl}/api/images/generate`,
      {
        prompt: request.prompt,
        model: request.model.name,
        provider: request.model.provider.toLowerCase(),
      },
      {
        headers: {
          'Idempotency-Key': `${id}:${slideId}:${elementId}:image`,
        },
      }
    );

    return this._mapImageResponse(res.data.data);
  }

  private _mapImageItem(data: any): ImageData {
    return {
      id: data.id,
      url: data.url,
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
      urls: data.cdnUrls,
    };
  }
}
