import { API_MODE, type ApiMode } from '@/shared/constants';
import {
  type PresentationApiService,
  type OutlineItem,
  type Presentation,
  type OutlineData,
  type PresentationCollectionRequest,
  type PresentationGenerationRequest,
  type PresentationGenerationResponse,
  type SlideLayoutSchema,
  type PresentationGenerationStartResponse,
} from '../types';
import { splitMarkdownToOutlineItems } from '../utils';
import { api } from '@/shared/api';
import { mapPagination, type ApiResponse, type Pagination } from '@/types/api';
import type { Slide } from '../types/slide';
// import api from '@/shared/api';

const mockOutlineOutput = `\`\`\`markdown
### The Amazing World of Artificial Intelligence!

Did you know computers can now think and learn just like humans? Let's discover how AI is changing our world!

**What makes AI so special?**

- **AI systems are smart programs** that can learn from experience
- They are like **digital brains** that solve problems for us
- This incredible technology helps us in ways we never imagined

_AI doesn't get tired or forget - it keeps learning 24/7!_

### How Does AI Actually Learn?

The secret ingredient is massive amounts of **data**! AI systems feed on information to become smarter.

**Data: The Brain Food of AI**

- **Machine Learning** is like teaching a computer to recognize patterns
- AI systems use **algorithms** to process and understand information
- Without quality data, AI cannot make good decisions

> Just like we learn from our mistakes, AI gets better with every example!

### AI in Our Daily Lives

From your smartphone to your favorite streaming service, AI is everywhere working behind the scenes.

**Where Can You Find AI Today?**

- **Voice assistants** like Siri and Alexa understand what you say
- **Recommendation systems** suggest movies and music you might like
- **Navigation apps** find the fastest route to your destination

_AI is like having a super-smart friend who never sleeps and always wants to help!_
\`\`\``;

export default class PresentationRealApiService implements PresentationApiService {
  baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  setPresentationAsParsed(id: string): Promise<any> {
    return api.patch<ApiResponse<Presentation>>(`${this.baseUrl}/api/presentations/${id}/parse`);
  }

  async generatePresentationImage(
    _id: string,
    _slideId: string,
    _elementId: string,
    _prompt: string,
    _style: string
  ): Promise<string> {
    const res = await api.post<ApiResponse<any>>(
      `${this.baseUrl}/api/images/generate`,
      {
        prompt: _prompt,
      },
      {
        headers: {
          'Idempotency-Key': `${_id}:${_slideId}:${_elementId}:image`,
        },
      }
    );

    return res.data.data.imageUrl;
  }

  upsertPresentationSlide(id: string, slide: Slide): Promise<any> {
    return api.put<ApiResponse<Presentation>>(
      `${this.baseUrl}/api/presentations/${id}/slides`,
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
          'Idempotency-Key': `${id}:${slide.id}:update`,
        },
      }
    );
  }

  async getStreamedPresentation(
    request: PresentationGenerationRequest,
    signal: AbortSignal
  ): Promise<
    {
      stream: AsyncIterable<string>;
    } & PresentationGenerationStartResponse
  > {
    const baseUrl = this.baseUrl;

    try {
      const response = await api.stream(
        `${baseUrl}/api/presentations/generate`,
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

  getType(): ApiMode {
    return API_MODE.real;
  }

  /**
   * @deprecated
   */
  async getPresentationItems(): Promise<Presentation[]> {
    const response = await api.get<ApiResponse<Presentation[]>>(`${this.baseUrl}/api/presentations/all`);
    return response.data.data.map(this._mapPresentationItem);
  }

  /**
   * @deprecated
   */
  async getOutlineItems(): Promise<OutlineItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return splitMarkdownToOutlineItems(mockOutlineOutput);
  }

  async getPresentations(request: PresentationCollectionRequest): Promise<ApiResponse<Presentation[]>> {
    const response = await api.get<ApiResponse<Presentation[]>>(`${this.baseUrl}/api/presentations`, {
      params: {
        page: (request.page || 0) + 1,
        pageSize: request.pageSize,
        sort: request.sort,
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

    const rawData = response.data.data;
    let parsedAiResult = rawData.result;

    if (typeof rawData.result === 'string') {
      const jsonBlocks = this._parseJsonBlocks(rawData.result);
      parsedAiResult = jsonBlocks[0]?.slides || jsonBlocks;
    }

    return parsedAiResult;
  }

  async generatePresentation(
    request: PresentationGenerationRequest
  ): Promise<PresentationGenerationResponse> {
    const response = await api.post<ApiResponse<PresentationGenerationResponse>>(
      `${this.baseUrl}/api/presentations/generate/batch`,
      request
    );

    const rawData = response.data.data;

    // Parse the aiResult which contains JSON wrapped in ```json code blocks
    let parsedAiResult = rawData.aiResult;
    if (typeof rawData.aiResult === 'string') {
      const jsonBlocks = this._parseJsonBlocks(rawData.aiResult);
      parsedAiResult = jsonBlocks[0]?.slides || jsonBlocks;
    }

    return {
      aiResult: parsedAiResult,
      presentation: rawData.presentation,
    };
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

  _mapPresentationItem(data: any): Presentation {
    return {
      id: data.id,
      title: data.title,
      thumbnail: data.thumbnail,
      slides: data.slides,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      isParsed: data.parsed || false,
    };
  }
}
