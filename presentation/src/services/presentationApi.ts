import { api } from '@aiprimary/api';
import type { Slide, SlideTheme } from '@/types/slides';
import type { ApiResponse } from '@aiprimary/api';
import type { SlideLayoutSchema } from '@/utils/slideLayout/types/schemas';
import { getSlideTemplates } from '@/hooks/useSlideTemplates';

export type { Slide, SlideTheme, SlideLayoutSchema };

export interface Presentation {
  id: string;
  title: string;
  theme: SlideTheme;
  viewport: {
    width: number;
    height: number;
  };
  slides: Slide[];
  isParsed?: boolean;
  [key: string]: any;
}

export interface PresentationGenerationRequest {
  outline: string;
  model: {
    name: string;
    provider: string;
  };
  slideCount: number;
  language: string;
  presentation: {
    theme: SlideTheme;
    viewport: {
      width: number;
      height: number;
    };
  };
  others: {
    contentLength: string;
    imageModel: {
      name: string;
      provider: string;
    };
  };
}

export interface PresentationGenerationStartResponse {
  presentationId: string;
  error?: unknown;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Mock data and utilities from mock.ts
const getDefaultPresentationTheme = (): SlideTheme => ({
  backgroundColor: '#ffffff',
  themeColors: ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'],
  fontColor: '#333333',
  fontName: 'Roboto',
  outline: {
    style: 'solid',
    width: 1,
    color: '#cccccc',
  },
  shadow: {
    h: 2,
    v: 2,
    blur: 4,
    color: 'rgba(0, 0, 0, 0.1)',
  },
  titleFontColor: '#0A2540',
  titleFontName: 'Roboto',
});

let mockPresentationItems: Presentation[] = [
  {
    id: 'ai123',
    title: 'Not Parsed Presentation 1',
    slides: [
      {
        id: 'slide1',
        elements: [],
        background: { type: 'solid', color: '#ffffff' },
      },
    ],
    isParsed: false,
    theme: getDefaultPresentationTheme(),
    viewport: { width: 1920, height: 1080 },
  },
];

let mockSlideData: SlideLayoutSchema[] = [];

const initMockPresentations = async () => {
  try {
    // In a real setup, load from files, but for now, keep simple
    // Assuming mock data is predefined
  } catch (error) {
    console.warn('Failed to load mock presentation data:', error);
  }
};

const initMockSlideData = async () => {
  try {
    const slides = getSlideTemplates();
    console.log('Loaded mock slides:', slides);
    mockSlideData.push(...slides);
  } catch (error: any) {
    console.warn('Failed to load mock slide data:', error);
  }
};

// Initialize mock data
// Moved to bottom with conditional check

export const presentationApi = {
  /**
   * Get AI result for a presentation by ID
   * Used during parsing phase to retrieve generated slide layouts
   */
  async getAiResultById(id: string): Promise<SlideLayoutSchema[]> {
    const response = await api.get<ApiResponse<SlideLayoutSchema[]>>(
      `${BASE_URL}/presentations/${id}/ai-result`
    );
    return response.data.data;
  },

  /**
   * Upsert a single slide for a presentation
   * Used when updating slides after generation or parsing
   */
  async upsertSlide(presentationId: string, slide: Slide): Promise<Presentation> {
    const response = await api.put<ApiResponse<Presentation>>(
      `${BASE_URL}/presentations/${presentationId}/slides`,
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
  },

  /**
   * Mark presentation as parsed (generation complete)
   */
  async setParsed(id: string): Promise<Presentation> {
    const response = await api.patch<ApiResponse<Presentation>>(`${BASE_URL}/presentations/${id}/parse`);
    return response.data.data;
  },

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
        `${BASE_URL}/presentations/generate`,
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
  },

  /**
   * Get presentation by ID
   */
  async getPresentation(id: string): Promise<Presentation> {
    const response = await api.get<ApiResponse<Presentation>>(`${BASE_URL}/presentations/${id}`);
    return response.data.data;
  },

  /**
   * Update presentation data
   */
  async updatePresentation(id: string, data: Presentation): Promise<Presentation> {
    const response = await api.put<ApiResponse<Presentation>>(`${BASE_URL}/presentations/${id}`, data);
    return response.data.data;
  },
};

export const mockPresentationApi = {
  /**
   * Get AI result for a presentation by ID
   */
  async getAiResultById(id: string): Promise<SlideLayoutSchema[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (id === 'ai123') {
      return mockSlideData;
    } else {
      return [];
    }
  },

  /**
   * Upsert a single slide for a presentation
   */
  async upsertSlide(presentationId: string, slide: Slide): Promise<Presentation> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const presentationIndex = mockPresentationItems.findIndex((item) => item.id === presentationId);
    if (presentationIndex === -1) {
      throw new Error(`Presentation with id ${presentationId} not found`);
    }
    const presentation = mockPresentationItems[presentationIndex];
    const slides = [...(presentation.slides || [])];
    const slideIndex = slides.findIndex((s) => s.id === slide.id);
    if (slideIndex === -1) {
      slides.push(slide);
    } else {
      slides[slideIndex] = slide;
    }
    const updatedPresentation = {
      ...presentation,
      slides,
      updatedAt: new Date().toISOString(),
      isParsed: true,
    };
    mockPresentationItems[presentationIndex] = updatedPresentation;
    return updatedPresentation;
  },

  /**
   * Mark presentation as parsed
   */
  async setParsed(id: string): Promise<Presentation> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const presentationIndex = mockPresentationItems.findIndex((item) => item.id === id);
    if (presentationIndex === -1) {
      throw new Error(`Presentation with id ${id} not found`);
    }
    const presentation = mockPresentationItems[presentationIndex];
    const updatedPresentation = {
      ...presentation,
      isParsed: true,
      updatedAt: new Date().toISOString(),
    };
    mockPresentationItems[presentationIndex] = updatedPresentation;
    return updatedPresentation;
  },

  /**
   * Stream presentation generation
   */
  async streamPresentation(
    request: PresentationGenerationRequest,
    signal: AbortSignal
  ): Promise<
    {
      stream: AsyncIterable<string>;
    } & PresentationGenerationStartResponse
  > {
    const presentationId = crypto.randomUUID();
    const newPresentation: Presentation = {
      id: presentationId,
      title: `Streamed Presentation`,
      slides: [],
      isParsed: false,
      theme: request.presentation.theme,
      viewport: request.presentation.viewport,
    };
    mockPresentationItems = [{ ...newPresentation }, ...mockPresentationItems];

    const stream: AsyncIterable<string> = {
      async *[Symbol.asyncIterator]() {
        for (const slide of mockSlideData) {
          if (signal.aborted) {
            return;
          }
          const jsonBlock = `${JSON.stringify({ ...slide }, null, 2)}`;
          yield jsonBlock;
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      },
    };

    return { presentationId, stream };
  },

  /**
   * Get presentation by ID
   */
  async getPresentation(id: string): Promise<Presentation> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const presentation = mockPresentationItems.find((item) => item.id === id);
    if (!presentation) {
      throw new Error(`Presentation with id ${id} not found`);
    }
    return presentation;
  },

  /**
   * Update presentation data
   */
  async updatePresentation(id: string, data: Presentation): Promise<Presentation> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const index = mockPresentationItems.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error('Presentation not found');
    }
    const updatedPresentation = {
      ...mockPresentationItems[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    mockPresentationItems[index] = updatedPresentation;
    return updatedPresentation;
  },
};

// Only initialize in non-test environments
if (typeof process === 'undefined' || process.env.NODE_ENV !== 'test') {
  initMockPresentations();
  initMockSlideData();
}
