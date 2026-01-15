import {
  type PresentationApiService,
  type GetSlideThemesParams,
  type UpdatePresentationRequest,
  type ImageOptions,
  type OutlineData,
} from '../types';
import type { User, SharedUserApiResponse, ShareRequest, ShareResponse } from '../types/share';
import { splitMarkdownToOutlineItems } from '../utils';
import { api, API_MODE, type ApiMode } from '@aiprimary/api';
import { mapPagination, type ApiResponse, type Pagination } from '@aiprimary/api';
import type {
  Presentation,
  SlideLayoutSchema,
  PresentationCollectionRequest,
  SlideTheme,
  SlideTemplate,
} from '@aiprimary/core';
import { parsePermissionHeader } from '../../../shared/utils/permission';

export default class PresentationRealApiService implements PresentationApiService {
  baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  getType(): ApiMode {
    return API_MODE.real;
  }

  async getSlideThemes(params?: GetSlideThemesParams): Promise<SlideTheme[]> {
    const res = await api.get<ApiResponse<SlideTheme[]>>(`${this.baseUrl}/api/slide-themes`, {
      params: {
        page: (params?.page || 0) + 1,
        pageSize: params?.pageSize,
      },
    });
    return res.data.data;
  }

  async getSlideThemesByIds(ids: string[]): Promise<SlideTheme[]> {
    if (ids.length === 0) {
      return [];
    }

    const res = await api.post<ApiResponse<SlideTheme[]>>(`${this.baseUrl}/api/slide-themes/by-ids`, {
      ids,
    });
    return res.data.data;
  }

  async getSlideTemplates(): Promise<SlideTemplate[]> {
    const res = await api.get<ApiResponse<SlideTemplate[]>>(`${this.baseUrl}/api/slide-templates`);
    return res.data.data;
  }

  async getStreamedOutline(
    request: OutlineData,
    signal: AbortSignal
  ): Promise<{ stream: AsyncIterable<string> }> {
    const baseUrl = this.baseUrl;

    const response = await api.stream(
      `${baseUrl}/api/presentations/outline-generate`,
      {
        ...request,
        model: request.model.name,
        provider: request.model.provider.toLowerCase(),
      },
      signal
    );

    const stream = {
      async *[Symbol.asyncIterator]() {
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No reader available');

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              // Stream completed successfully - cancel to properly close the HTTP/2 stream
              await reader.cancel();
              break;
            }

            const text = new TextDecoder().decode(value);
            yield text;
          }
        } catch (error) {
          // Cancel the reader on error to properly close the stream
          try {
            await reader.cancel();
          } catch (cancelError) {
            // Ignore cancel errors
            console.warn('Failed to cancel reader:', cancelError);
          }
          throw error;
        } finally {
          reader.releaseLock();
        }
      },
    };

    return { stream };
  }

  async getPresentations(request: PresentationCollectionRequest): Promise<ApiResponse<Presentation[]>> {
    const response = await api.get<ApiResponse<Presentation[]>>(`${this.baseUrl}/api/presentations`, {
      params: {
        page: (request.page || 0) + 1,
        pageSize: request.pageSize,
        sort: request.sort,
        filter: request.filter,
      },
    });

    return {
      ...response.data,
      data: response.data.data.map(this._mapPresentationItem),
      pagination: mapPagination(response.data.pagination as Pagination),
    };
  }

  async createPresentation(data: Presentation): Promise<Presentation> {
    const response = await api.post<ApiResponse<Presentation>>(`${this.baseUrl}/api/presentations`, data);
    return this._mapPresentationItem(response.data.data);
  }

  async getPresentationById(id: string): Promise<Presentation | null> {
    const response = await api.get<ApiResponse<Presentation>>(`${this.baseUrl}/api/presentations/${id}`);
    const presentation = this._mapPresentationItem(response.data.data);

    // Extract permission from response header (added by backend PermissionHeaderResponseWrapper)
    const permissionHeader = response.headers['permission']; // axios lowercases headers
    if (permissionHeader) {
      presentation.permission = parsePermissionHeader(permissionHeader);
    }

    return presentation;
  }

  async getAiResultById(id: string): Promise<{
    slides: SlideLayoutSchema[];
    generationOptions?: ImageOptions;
  }> {
    const response = await api.get<ApiResponse<any>>(`${this.baseUrl}/api/presentations/${id}/ai-result`);

    const rawData = response.data.data;

    // Parse slides
    let slides: SlideLayoutSchema[];
    if (typeof rawData.result === 'string') {
      // Try parsing as newline-separated JSON first
      try {
        slides = rawData.result
          .split('\n')
          .filter((line: string) => line.trim().length > 0)
          .map((line: string) => JSON.parse(line));
      } catch (error) {
        console.error('Error parsing newline-separated JSON:', error);
        // Fallback to parsing ```json blocks
        const jsonBlocks = this._parseJsonBlocks(rawData.result);
        slides = jsonBlocks[0]?.slides || jsonBlocks;
      }
    } else {
      slides = rawData.result;
    }

    // Parse generation options if available
    let generationOptions: ImageOptions | undefined;
    if (rawData.generationOptions) {
      try {
        generationOptions = JSON.parse(rawData.generationOptions);
      } catch (error) {
        console.error('Failed to parse generation options:', error);
      }
    }

    return { slides, generationOptions };
  }

  private _parseJsonBlocks(input: string): any[] {
    // Remove ```json and ``` wrappers and parse each JSON block
    return input
      .split('---')
      .map((block: string) => block.trim())
      .filter((block: string) => block.startsWith('```json') && block.endsWith('```'))
      .map((block: string) => {
        const jsonContent = block.replace(/^```json\n/, '').replace(/\n```$/, '');
        try {
          return JSON.parse(jsonContent);
        } catch (error) {
          console.warn('Failed to parse JSON block:', jsonContent, error);
          return null;
        }
      })
      .filter((parsed: any) => parsed !== null);
  }

  async updatePresentationTitle(id: string, name: string): Promise<any | null> {
    await api.patch(`/api/presentations/${id}/title`, {
      title: name,
    });
    // API returns 204 No Content
    return null;
  }

  async updatePresentation(id: string, data: UpdatePresentationRequest | FormData): Promise<any> {
    const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};

    await api.put<ApiResponse<Presentation>>(`${this.baseUrl}/api/presentations/${id}`, data, config);
  }

  async deletePresentation(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/api/presentations/${id}`);
  }

  _mapPresentationItem(data: any): Presentation {
    return {
      id: data?.id,
      title: data?.title,
      thumbnail: data?.thumbnail,
      slides: data?.slides,
      theme: data?.theme,
      viewport: data?.viewport,
      isParsed: data?.parsed || false,
      createdAt: data?.createdAt,
      updatedAt: data?.updatedAt,
    };
  }

  async searchUsers(query: string): Promise<User[]> {
    const response = await api.get<ApiResponse<User[]>>(`${this.baseUrl}/api/user/search`, {
      params: { q: query, limit: 10 },
    });
    return response.data.data;
  }

  async sharePresentation(id: string, shareData: ShareRequest): Promise<ShareResponse> {
    const response = await api.post<ApiResponse<ShareResponse>>(
      `${this.baseUrl}/api/resources/${id}/share`,
      shareData
    );
    return response.data.data;
  }

  async getSharedUsers(id: string): Promise<SharedUserApiResponse[]> {
    const response = await api.get<ApiResponse<SharedUserApiResponse[]>>(
      `${this.baseUrl}/api/resources/${id}/shared-users`
    );
    return response.data.data;
  }

  async revokeAccess(presentationId: string, userId: string): Promise<void> {
    await api.post(`${this.baseUrl}/api/resources/${presentationId}/revoke`, {
      targetUserId: userId,
    });
  }
}
