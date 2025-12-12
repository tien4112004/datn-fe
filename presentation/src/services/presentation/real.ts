import { api } from '@aiprimary/api';
import type { ApiResponse } from '@aiprimary/api';
import type { PresentationGenerationRequest, PresentationGenerationStartResponse } from './types';
import type { ApiService } from '@aiprimary/api';
import { getBackendUrl } from '@aiprimary/api';
import type { Presentation, Slide, SlideLayoutSchema } from '@aiprimary/core';

const BASE_URL = getBackendUrl();

export class PresentationApiService implements ApiService {
  baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  getType() {
    return 'real' as const;
  }

  /**
   * Get AI result for a presentation by ID
   * Used during parsing phase to retrieve generated slide layouts
   */
  async getAiResultById(id: string): Promise<SlideLayoutSchema[]> {
    const response = await api.get<ApiResponse<SlideLayoutSchema[]>>(
      `${this.baseUrl}/presentations/${id}/ai-result`
    );
    return response.data.data;
  }

  /**
   * Upsert a single slide for a presentation
   * Used when updating slides after generation or parsing
   */
  async upsertSlide(presentationId: string, slide: Slide): Promise<Presentation> {
    const response = await api.put<ApiResponse<Presentation>>(
      `${this.baseUrl}/presentations/${presentationId}/slides`,
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
          'Idempotency-Key': `${presentationId}:${slide.id}:update`,
        },
      }
    );
    return response.data.data;
  }

  /**
   * Mark presentation as parsed (generation complete)
   */
  async setParsed(id: string): Promise<Presentation> {
    const response = await api.patch<ApiResponse<Presentation>>(`${this.baseUrl}/presentations/${id}/parse`);
    return response.data.data;
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
      const response = await api.stream(
        `${this.baseUrl}/presentations/generate`,
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
              if (done) break;

              const text = new TextDecoder().decode(value);
              yield text;
            }
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
    const response = await api.get<ApiResponse<Presentation>>(`${this.baseUrl}/presentations/${id}`);
    return response.data.data;
  }

  /**
   * Update presentation data
   */
  async updatePresentation(id: string, data: Presentation): Promise<Presentation> {
    const response = await api.put<ApiResponse<Presentation>>(`${this.baseUrl}/presentations/${id}`, data);
    return response.data.data;
  }
}
