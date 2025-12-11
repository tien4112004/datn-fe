import type { Slide } from '@/types/slides';
import type { SlideLayoutSchema } from '@/utils/slideLayout/types/schemas';
import { getSlideTemplates } from '@/hooks/useSlideTemplates';
import type {
  Presentation,
  PresentationGenerationRequest,
  PresentationGenerationStartResponse,
} from './types';
import type { ApiService } from '@aiprimary/api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const getDefaultPresentationTheme = () => ({
  backgroundColor: '#ffffff',
  themeColors: ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'],
  fontColor: '#333333',
  fontName: 'Roboto',
  outline: {
    style: 'solid' as const,
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

const initMockSlideData = async () => {
  try {
    const slides = getSlideTemplates();
    console.log('Loaded mock slides:', slides);
    mockSlideData.push(...slides);
  } catch (error: any) {
    console.warn('Failed to load mock slide data:', error);
  }
};

// Initialize mock data only in non-test environments
if (typeof process === 'undefined' || process.env.NODE_ENV !== 'test') {
  initMockSlideData();
}

export class MockPresentationApiService implements ApiService {
  baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  getType() {
    return 'mock' as const;
  }

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
  }

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
  }

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
  }

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
  }

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
  }

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
  }
}
