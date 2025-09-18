import { API_MODE, type ApiMode } from '@/shared/constants';
import {
  type PresentationApiService,
  type OutlineItem,
  type Presentation,
  type OutlineData,
  type PresentationCollectionRequest,
  type PresentationGenerationRequest,
  type PresentationGenerationResponse,
} from '../types';
import { splitMarkdownToOutlineItems } from '../utils';
import { api } from '@/shared/api';
import { mapPagination, type ApiResponse, type Pagination } from '@/types/api';
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
  // async getStreamedOutline(
  //   request: OutlinePromptRequest,
  //   signal: AbortSignal
  // ): Promise<ReadableStream<Uint8Array>> {
  //   const response = await fetch('http://localhost:8080/presentations/mock-outline', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify(request),
  //     signal,
  //   });

  //   if (!response.ok) {
  //     throw new Error(`HTTP error! status: ${response.status}`);
  //   }

  //   if (!response.body) {
  //     throw new Error('No response body');
  //   }

  //   return response.body;
  // }

  baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  getStreamedOutline(request: OutlineData, signal: AbortSignal): AsyncIterable<string> {
    const baseUrl = this.baseUrl;
    return {
      async *[Symbol.asyncIterator]() {
        const response = await api.stream(`${baseUrl}/api/presentations/outline-generate`, request, signal);

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
  }

  getType(): ApiMode {
    return API_MODE.real;
  }

  async getPresentationItems(): Promise<Presentation[]> {
    const response = await api.get<ApiResponse<Presentation[]>>(`${this.baseUrl}/api/presentations/all`);
    return response.data.data.map(this._mapPresentationItem);
  }

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

  async getAiResultById(id: string): Promise<any> {
    const response = await api.get<ApiResponse<any>>(`${this.baseUrl}/api/presentations/${id}/ai-result`);

    const rawData = response.data.data;
    let parsedAiResult = rawData.result;

    if (typeof rawData.result === 'string') {
      // Remove ```json and ``` wrappers and parse each JSON block
      const jsonBlocks = rawData.result
        .split('---')
        .map((block) => block.trim())
        .filter((block) => block.startsWith('```json') && block.endsWith('```'))
        .map((block) => {
          const jsonContent = block.replace(/^```json\n/, '').replace(/\n```$/, '');
          try {
            return JSON.parse(jsonContent);
          } catch (error) {
            console.warn('Failed to parse JSON block:', jsonContent, error);
            return null;
          }
        })
        .filter((parsed) => parsed !== null);

      parsedAiResult = jsonBlocks[0].slides;
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
      // Remove ```json and ``` wrappers and parse each JSON block
      const jsonBlocks = rawData.aiResult
        .split('---')
        .map((block) => block.trim())
        .filter((block) => block.startsWith('```json') && block.endsWith('```'))
        .map((block) => {
          const jsonContent = block.replace(/^```json\n/, '').replace(/\n```$/, '');
          try {
            return JSON.parse(jsonContent);
          } catch (error) {
            console.warn('Failed to parse JSON block:', jsonContent, error);
            return null;
          }
        })
        .filter((parsed) => parsed !== null);

      parsedAiResult = jsonBlocks[0].slides;
    }

    console.log('Parsed AI Result:', parsedAiResult);

    return {
      aiResult: parsedAiResult,
      presentation: rawData.presentation,
    };
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
