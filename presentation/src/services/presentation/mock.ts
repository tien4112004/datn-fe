import type { Presentation, Slide, SlideTheme } from '@aiprimary/core';
import type { SlideLayoutSchema } from '@/utils/slideLayout/types/schemas';
import { getSlideTemplates } from '@/hooks/useSlideTemplates';
import type {
  PresentationGenerationRequest,
  PresentationGenerationStartResponse,
  SharedUserApiResponse,
  SearchUserApiResponse,
  SharePresentationRequest,
} from './types';
import type { ImageGenerationParams } from '../image/types';
import type { ApiService } from '@aiprimary/api';
import { getBackendUrl } from '@aiprimary/api';

const BASE_URL = getBackendUrl();

// Mock preset themes for testing
const MOCK_PRESET_THEMES = [
  {
    background: '#ffffff',
    fontColor: '#333333',
    borderColor: '#41719c',
    fontname: 'sans-serif',
    colors: ['#5b9bd5', '#ed7d31', '#a5a5a5', '#ffc000', '#4472c4', '#70ad47'],
  },
  {
    background: '#17444e',
    fontColor: '#ffffff',
    borderColor: '#800c0b',
    fontname: 'sans-serif',
    colors: ['#b01513', '#ea6312', '#e6b729', '#6bab90', '#55839a', '#9e5d9d'],
  },
  {
    background: '#36234d',
    fontColor: '#ffffff',
    borderColor: '#830949',
    fontname: 'sans-serif',
    colors: ['#b31166', '#e33d6f', '#e45f3c', '#e9943a', '#9b6bf2', '#d63cd0'],
  },
  {
    background: '#333333',
    fontColor: '#ffffff',
    borderColor: '#7c91a8',
    fontname: 'sans-serif',
    colors: ['#bdc8df', '#003fa9', '#f5ba00', '#ff7567', '#7676d9', '#923ffc'],
  },
];

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
  async getAiResultById(id: string): Promise<{
    slides: SlideLayoutSchema[];
    generationOptions?: Omit<ImageGenerationParams, 'prompt' | 'slideId'>;
  }> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (id === 'ai123') {
      return {
        slides: mockSlideData,
        generationOptions: {
          artStyle: 'digital-art',
          artStyleModifiers: 'vibrant colors, modern',
          imageModel: {
            name: 'dall-e-3',
            provider: 'openai',
          },
          themeStyle: 'modern',
          themeDescription: 'clean and professional',
        },
      };
    } else {
      return { slides: [] };
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
   * Upsert multiple slides in a single request (mock implementation)
   */
  async upsertSlides(presentationId: string, slides: Slide[]): Promise<Presentation> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const presentationIndex = mockPresentationItems.findIndex((item) => item.id === presentationId);
    if (presentationIndex === -1) {
      throw new Error(`Presentation with id ${presentationId} not found`);
    }

    const presentation = mockPresentationItems[presentationIndex];
    const existingSlides = [...(presentation.slides || [])];

    // Upsert each slide in the incoming list
    for (const slide of slides) {
      const idx = existingSlides.findIndex((s) => s.id === slide.id);
      if (idx === -1) {
        existingSlides.push(slide);
      } else {
        existingSlides[idx] = slide;
      }
    }

    const updatedPresentation = {
      ...presentation,
      slides: existingSlides,
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
    const presentationId = request.presentationId || `pres_${Math.random().toString(36).substr(2, 9)}`;
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
  async updatePresentation(id: string, data: Partial<Presentation>): Promise<Presentation> {
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

  /**
   * Get slide themes (mock implementation with pagination support)
   * Converts MOCK_PRESET_THEMES to SlideTheme format
   */
  async getSlideThemes(params?: { page?: number; limit?: number }): Promise<{
    data: SlideTheme[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  }> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const page = params?.page ?? 0;
    const limit = params?.limit ?? 10;

    const allThemes = MOCK_PRESET_THEMES.map((preset, index) => ({
      id: `theme-${index + 1}`,
      name: `Theme ${index + 1}`,
      backgroundColor: preset.background,
      themeColors: preset.colors,
      fontColor: preset.fontColor,
      fontName: preset.fontname,
      titleFontColor: preset.fontColor,
      titleFontName: preset.fontname,
      outline: {
        width: 2,
        style: 'solid' as const,
        color: preset.borderColor,
      },
      shadow: {
        h: 3,
        v: 3,
        blur: 2,
        color: '#808080',
      },
    }));

    const start = page * limit;
    const end = start + limit;
    const paginatedThemes = allThemes.slice(start, end);

    return {
      data: paginatedThemes,
      total: allThemes.length,
      page,
      limit,
      hasMore: end < allThemes.length,
    };
  }

  /**
   * Get shared users for a presentation (mock implementation)
   */
  async getSharedUsers(presentationId: string): Promise<SharedUserApiResponse[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [
      {
        userId: 'user1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        permission: 'read',
      },
      {
        userId: 'user2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        permission: 'comment',
      },
    ];
  }

  /**
   * Search users by query string (mock implementation)
   */
  async searchUsers(query: string): Promise<SearchUserApiResponse[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const mockUsers = [
      { id: 'user3', firstName: 'Alice', lastName: 'Johnson', email: 'alice.johnson@example.com' },
      { id: 'user4', firstName: 'Bob', lastName: 'Williams', email: 'bob.williams@example.com' },
      { id: 'user5', firstName: 'Charlie', lastName: 'Brown', email: 'charlie.brown@example.com' },
      { id: 'user6', firstName: 'Diana', lastName: 'Davis', email: 'diana.davis@example.com' },
    ];
    return mockUsers.filter(
      (user) =>
        user.firstName.toLowerCase().includes(query.toLowerCase()) ||
        user.lastName.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
    );
  }

  /**
   * Share presentation with users (mock implementation)
   */
  async sharePresentation(presentationId: string, request: SharePresentationRequest): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    console.log('Mock: Shared presentation', presentationId, 'with users:', request);
  }

  /**
   * Revoke access for a user (mock implementation)
   */
  async revokeAccess(presentationId: string, userId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    console.log('Mock: Revoked access for user', userId, 'from presentation', presentationId);
  }
}
