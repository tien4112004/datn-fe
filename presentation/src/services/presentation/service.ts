import { api, webViewApi } from '@aiprimary/api';
import type { ApiResponse, ApiClient } from '@aiprimary/api';
import type {
  PresentationGenerationRequest,
  PresentationGenerationStartResponse,
  SharedUserApiResponse,
  SearchUserApiResponse,
  SharePresentationRequest,
  PublicAccessRequest,
  PublicAccessResponse,
  ResourcePermissionResponse,
  ShareStateResponse,
} from './types';
import type { ImageGenerationParams } from '../image/types';
import type { ApiService } from '@aiprimary/api';
import { getBackendUrl } from '@aiprimary/api';
import type { Presentation, Slide, SlideLayoutSchema, SlideTheme } from '@aiprimary/core';

const BASE_URL = getBackendUrl();

export class PresentationApiService implements ApiService {
  baseUrl: string;
  private apiClient: ApiClient;

  constructor(baseUrl: string = BASE_URL, apiClient: ApiClient = api) {
    this.baseUrl = baseUrl;
    this.apiClient = apiClient;
  }

  getType() {
    return 'real' as const;
  }

  /**
   * Get AI result for a presentation by ID
   * Used during parsing phase to retrieve generated slide layouts
   */
  async getAiResultById(id: string): Promise<{
    slides: SlideLayoutSchema[];
    generationOptions?: Omit<ImageGenerationParams, 'prompt' | 'slideId'>;
  }> {
    const response = await this.apiClient.get<ApiResponse<any>>(
      `${this.baseUrl}/api/presentations/${id}/ai-result`
    );

    const rawData = response.data.data;

    // Extract the result field from the response
    const data = rawData.result || rawData;

    // Parse slides
    let slides: SlideLayoutSchema[];
    if (typeof data === 'string') {
      slides = data
        .split('\n')
        .filter((line) => line.trim().length > 0)
        .map((line) => JSON.parse(line));
    } else {
      slides = data;
    }

    // Parse generation options if available
    let generationOptions: Omit<ImageGenerationParams, 'prompt' | 'slideId'> | undefined;
    if (rawData.generationOptions) {
      try {
        generationOptions = JSON.parse(rawData.generationOptions);
      } catch (error) {
        console.error('[getAiResultById] Failed to parse generation options:', error);
      }
    }

    return { slides, generationOptions };
  }

  /**
   * Upsert a single slide for a presentation
   * Used when updating slides after generation or parsing
   */
  async upsertSlide(presentationId: string, slide: Slide): Promise<Presentation> {
    const response = await this.apiClient.put<ApiResponse<Presentation>>(
      `${this.baseUrl}/api/presentations/${presentationId}/slides`,
      {
        slides: [
          {
            ...slide,
            slideId: slide.id,
          },
        ],
      },
      {
        headers: {
          'Idempotency-Key': `${presentationId}:${slide.id}`,
        },
      }
    );
    return this._mapPresentationItem(response.data.data);
  }

  /**
   * Upsert multiple slides in a single request
   */
  async upsertSlides(presentationId: string, slides: Slide[]): Promise<any> {
    const payload = {
      slides: slides.map((s) => ({ ...s, slideId: s.id })),
    };

    await this.apiClient.put<ApiResponse<Presentation>>(
      `${this.baseUrl}/api/presentations/${presentationId}/slides`,
      payload,
      {
        headers: {
          'Idempotency-Key': `${presentationId}:${slides[0].id}`,
        },
      }
    );

    return;
  }

  /**
   * Stream presentation generation
   * Returns a stream of stringified JSON slide objects
   */
  async streamPresentation(
    request: PresentationGenerationRequest,
    signal: AbortSignal
  ): Promise<
    {
      stream: AsyncIterable<string>;
    } & PresentationGenerationStartResponse
  > {
    try {
      const response = await this.apiClient.stream(
        `${this.baseUrl}/api/presentations/generate`,
        {
          ...request,
          model: request.model.name,
          provider: request.model.provider.toLowerCase(),
        },
        signal
      );

      const presentationId = response.headers.get('X-Presentation') || '';

      const stream: AsyncIterable<string> = {
        async *[Symbol.asyncIterator]() {
          const reader = response.body?.getReader();
          if (!reader) throw new Error('No reader available');

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                await reader.cancel();
                break;
              }

              const text = new TextDecoder().decode(value);
              yield text;
            }
          } catch (error) {
            try {
              await reader.cancel();
            } catch {
              // Ignore cancel errors
            }
            throw error;
          } finally {
            reader.releaseLock();
          }
        },
      };

      return { presentationId, stream };
    } catch (error) {
      return { presentationId: '', error, stream: (async function* () {})() };
    }
  }

  /**
   * Get presentation by ID
   */
  async getPresentation(id: string): Promise<Presentation> {
    const response = await this.apiClient.get<ApiResponse<Presentation>>(
      `${this.baseUrl}/api/presentations/${id}`
    );
    return this._mapPresentationItem(response.data.data);
  }

  /**
   * Update presentation data
   */
  async updatePresentation(id: string, data: Presentation | FormData): Promise<any> {
    const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};

    await this.apiClient.put<ApiResponse<Presentation>>(
      `${this.baseUrl}/api/presentations/${id}`,
      data,
      config
    );
  }

  /**
   * Get slide themes from the backend with pagination support
   */
  async getSlideThemes(params?: { page?: number; limit?: number }): Promise<{
    data: SlideTheme[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  }> {
    const page = (params?.page ?? 0) + 1;
    const limit = params?.limit ?? 10;

    const response = await this.apiClient.get<ApiResponse<SlideTheme[]>>(
      `${this.baseUrl}/api/slide-themes?page=${page}&limit=${limit}`
    );

    const pagination = response.data.pagination;
    if (pagination) {
      const backendPage = pagination.currentPage ?? page;
      const backendLimit = pagination.pageSize ?? limit;
      const total = pagination.totalItems ?? 0;

      return {
        data: response.data.data,
        total,
        page: Math.max(0, backendPage - 1),
        limit: backendLimit,
        hasMore: backendPage * backendLimit < total,
      };
    }

    // Last-resort fallback: return empty list
    return { data: [], total: 0, page: 0, limit: 0, hasMore: false };
  }

  _mapPresentationItem(data: any): Presentation {
    return {
      id: data.id,
      title: data.title,
      thumbnail: data.thumbnail,
      theme: data.theme,
      viewport: data.viewport,
      slides: data.slides,
      isParsed: data.isParsed || false,
    };
  }

  /**
   * Get shared users for a presentation
   */
  async getSharedUsers(presentationId: string): Promise<SharedUserApiResponse[]> {
    const response = await this.apiClient.get<ApiResponse<SharedUserApiResponse[]>>(
      `${this.baseUrl}/api/resources/${presentationId}/shared-users`
    );
    return response.data.data;
  }

  /**
   * Search users by query string
   */
  async searchUsers(query: string): Promise<SearchUserApiResponse[]> {
    const response = await this.apiClient.get<ApiResponse<SearchUserApiResponse[]>>(
      `${this.baseUrl}/api/users?search=${encodeURIComponent(query)}`
    );
    return response.data.data;
  }

  /**
   * Share presentation with users
   */
  async sharePresentation(presentationId: string, request: SharePresentationRequest): Promise<void> {
    await this.apiClient.post<ApiResponse<void>>(
      `${this.baseUrl}/api/resources/${presentationId}/share`,
      request
    );
  }

  /**
   * Revoke access for a user
   */
  async revokeAccess(presentationId: string, userId: string): Promise<void> {
    await this.apiClient.post<ApiResponse<void>>(`${this.baseUrl}/api/resources/${presentationId}/revoke`, {
      targetUserId: userId,
    });
  }

  /**
   * Set public access for presentation
   */
  async setPublicAccess(presentationId: string, request: PublicAccessRequest): Promise<PublicAccessResponse> {
    const response = await this.apiClient.put<ApiResponse<PublicAccessResponse>>(
      `${this.baseUrl}/api/resources/${presentationId}/public-access`,
      request
    );
    return response.data.data;
  }

  /**
   * Get public access status
   */
  async getPublicAccessStatus(presentationId: string): Promise<PublicAccessResponse> {
    const response = await this.apiClient.get<ApiResponse<PublicAccessResponse>>(
      `${this.baseUrl}/api/resources/${presentationId}/public-access`
    );
    return response.data.data;
  }

  /**
   * Get complete share state in a single API call
   * Combines shared users, public access settings, and current user permission
   */
  async getShareState(presentationId: string): Promise<ShareStateResponse> {
    const response = await this.apiClient.get<ApiResponse<ShareStateResponse>>(
      `${this.baseUrl}/api/resources/${presentationId}/share-state`
    );
    return response.data.data;
  }
}
