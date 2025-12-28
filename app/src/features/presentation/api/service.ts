import {
  type PresentationApiService,
  type Presentation,
  type SlideLayoutSchema,
  type PresentationGenerateDraftRequest,
  type GetSlideThemesParams,
  type UpdatePresentationRequest,
  type OutlineData,
} from '../types';
import { api, API_MODE, type ApiMode } from '@aiprimary/api';
import { mapPagination, type ApiResponse, type Pagination } from '@aiprimary/api';
import type { SlideTheme, SlideTemplate, PresentationCollectionRequest } from '../types/slide';

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
        page: params?.page,
        pageSize: params?.pageSize,
      },
    });
    return res.data.data;
  }

  async getSlideTemplates(): Promise<SlideTemplate[]> {
    const res = await api.get<ApiResponse<SlideTemplate[]>>(`${this.baseUrl}/api/slide-templates`);
    return res.data.data;
  }

  async draftPresentation(request: PresentationGenerateDraftRequest): Promise<Presentation> {
    var response = await api.post<ApiResponse<Presentation>>(`${this.baseUrl}/api/presentations`, request);
    return response.data.data;
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
            if (done) break;

            const text = new TextDecoder().decode(value);
            yield text;
          }
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
    return this._mapPresentationItem(response.data.data);
  }

  async getAiResultById(id: string): Promise<SlideLayoutSchema[]> {
    const response = await api.get<ApiResponse<any>>(`${this.baseUrl}/api/presentations/${id}/ai-result`);

    console.log('Full API Response:', response.data);
    const rawData = response.data.data;
    console.log('rawData:', rawData);
    console.log('rawData.result type:', typeof rawData.result);

    let parsedAiResult = rawData.result;

    if (typeof rawData.result === 'string') {
      // Try parsing as newline-separated JSON first
      try {
        parsedAiResult = rawData.result
          .split('\n')
          .filter((line: string) => line.trim().length > 0)
          .map((line: string) => JSON.parse(line));
        console.log('Parsed AI result (newline-separated):', parsedAiResult);
      } catch (error) {
        console.error('Error parsing newline-separated JSON:', error);
        // Fallback to parsing ```json blocks
        const jsonBlocks = this._parseJsonBlocks(rawData.result);
        parsedAiResult = jsonBlocks[0]?.slides || jsonBlocks;
        console.log('Parsed AI result (json blocks):', parsedAiResult);
      }
    }

    console.log('Final parsedAiResult:', parsedAiResult);
    console.log('Is array?', Array.isArray(parsedAiResult));

    return parsedAiResult;
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
}
