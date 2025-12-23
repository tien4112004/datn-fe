import { API_MODE, type ApiMode } from '@aiprimary/api';
import {
  type OutlineItem,
  type OutlineData,
  type PresentationApiService,
  type Presentation,
  type PresentationCollectionRequest,
  type PresentationGenerationRequest,
  type PresentationGenerateDraftRequest,
  type PresentationGenerationResponse,
  type SlideLayoutSchema,
  type GetSlideThemesParams,
  type UpdatePresentationRequest,
} from '../types';
import type { ApiResponse } from '@aiprimary/api';
import type { Slide, SlideTheme, SlideTemplate } from '../types/slide';
import { moduleMethodMap } from '../components/remote/module';
import { THEMES_DATA } from '../utils/themes';

/**
 * Default theme configuration for generated presentations
 */
export const getDefaultPresentationTheme = (): SlideTheme => ({
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

/**
 * Mock data for testing presentation generation
 */
export const getMockSlideData = (): SlideLayoutSchema[] => mockSlideData;

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
  },
];

const initMockPresentations = async () => {
  try {
    const responses = await Promise.all([
      fetch('/data/presentation.json'),
      fetch('/data/presentation2.json'),
    ]);
    const presentations = await Promise.all(responses.map((res) => res.json()));
    for (let i = 0; i < 20; i++) {
      presentations.forEach((p, idx) => {
        mockPresentationItems.push({
          ...p,
          id: `${p.id || idx}-${i}`,
          title: p.title ? `${p.title} (${i + 1})` : `Presentation ${i + 1}`,
        });
      });
    }
  } catch (error) {
    console.warn('Failed to load mock presentation data:', error);
  }
};

const initMockSlideData = async () => {
  await moduleMethodMap['method']()
    .then((mod) => {
      const getMockSlides = (mod.default as any).getSlideTemplates;

      const slides = getMockSlides();
      console.log('Loaded mock slides:', slides);
      mockSlideData.push(...slides);
    })
    .catch((error) => {
      console.warn('Failed to load mock slide data:', error);
    });
};

// Only initialize in non-test environments
if (typeof process === 'undefined' || process.env.NODE_ENV !== 'test') {
  initMockPresentations();
  initMockSlideData();
}

export default class PresentationMockService implements PresentationApiService {
  baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  async setPresentationAsParsed(id: string): Promise<Presentation> {
    // Simulate API delay
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

    // Update the mock data
    mockPresentationItems[presentationIndex] = updatedPresentation;

    return updatedPresentation;
  }

  async upsertPresentationSlide(id: string, slide: Slide): Promise<Presentation> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    const presentationIndex = mockPresentationItems.findIndex((item) => item.id === id);

    if (presentationIndex === -1) {
      throw new Error(`Presentation with id ${id} not found`);
    }

    const presentation = mockPresentationItems[presentationIndex];
    const slides = [...(presentation.slides || [])];

    // Upsert
    const slideIndex = slides.findIndex((s) => s.id === slide.id);
    if (slideIndex === -1) {
      slides.push(slide);
    } else {
      slides[slideIndex] = slide;
    }

    const updatedPresentation = {
      ...presentation,
      slides: slides,
      updatedAt: new Date().toISOString(),
      isParsed: true,
    };

    // Update the mock data
    mockPresentationItems[presentationIndex] = updatedPresentation;

    return updatedPresentation;
  }

  async getAiResultById(id: string): Promise<SlideLayoutSchema[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (id === 'ai123') {
      return getMockSlideData();
    } else {
      return [];
    }
  }

  async getStreamedOutline(
    _request: OutlineData,
    signal: AbortSignal
  ): Promise<{ stream: AsyncIterable<string> }> {
    const chunks = mockOutlineOutput.split(' ');

    const stream = {
      async *[Symbol.asyncIterator]() {
        for (const chunk of chunks) {
          if (signal.aborted) {
            return;
          }

          yield chunk + ' ';
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
      },
    };

    return { stream };
  }

  async getStreamedPresentation(
    _request: PresentationGenerationRequest,
    signal: AbortSignal
  ): Promise<{ presentationId: string; stream: AsyncIterable<string> }> {
    const presentationId = crypto.randomUUID();
    const mockSlides = getMockSlideData();

    // Create and append new presentation to the mock list
    const newPresentation: Presentation = {
      id: presentationId,
      title: `Streamed Presentation`,
      slides: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isParsed: false,
      theme: _request.presentation?.theme || {
        backgroundColor: '#ffffff',
        themeColors: [],
        fontColor: '#000000',
        fontName: 'Arial',
        titleFontName: 'Arial',
        titleFontColor: '#000000',
        outline: {} as any,
        shadow: {} as any,
      },
      viewport: _request.presentation?.viewport || { width: 1024, height: 768 },
    };

    // Add the new presentation to the mock list
    mockPresentationItems = [{ ...newPresentation }, ...mockPresentationItems];

    const stream = {
      async *[Symbol.asyncIterator]() {
        // Stream each slide as a separate JSON block
        for (const slide of mockSlides) {
          if (signal.aborted) {
            return;
          }

          const jsonBlock = `${JSON.stringify({ ...slide }, null, 2)}`;
          yield jsonBlock;
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      },
    };

    return {
      presentationId,
      stream,
    };
  }

  getType(): ApiMode {
    return API_MODE.mock;
  }

  /**
   * @deprecated
   */
  async getPresentationItems(): Promise<Presentation[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockPresentationItems]), 500);
    });
  }

  /**
   * @deprecated
   */
  async getOutlineItems(): Promise<OutlineItem[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockOutlineItems]), 500);
    });
  }

  async createPresentation(data: Presentation): Promise<Presentation> {
    return new Promise((resolve) => {
      const id = String(Date.now());
      mockPresentationItems.push({ ...data, id });
      setTimeout(() => resolve({ ...data, id }), 500);
    });
  }

  async getPresentationById(id: string): Promise<Presentation | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const presentation = mockPresentationItems.find((item) => item.id === id) || null;
        resolve(presentation);
      }, 500);
    });
  }

  getPresentations(request: PresentationCollectionRequest): Promise<ApiResponse<Presentation[]>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const page = request.page ?? 0;
        const pageSize = request.pageSize ?? 10;
        const start = page * pageSize;
        const end = start + pageSize;
        const pagedItems = mockPresentationItems.slice(start, end);

        resolve({
          data: pagedItems,
          success: true,
          message: 'Mock presentations fetched successfully',
          code: 200,
          pagination: {
            currentPage: page,
            pageSize,
            totalItems: mockPresentationItems.length,
            totalPages: Math.ceil(mockPresentationItems.length / pageSize),
          },
        });
      }, 500);
    });
  }

  async generatePresentation(_: PresentationGenerationRequest): Promise<PresentationGenerationResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockSlides = getMockSlideData();
        const presentation = {
          id: crypto.randomUUID(),
          title: `Generated Presentation`,
          slides: [
            {
              id: crypto.randomUUID(),
              elements: [],
              background: {
                type: 'solid' as const,
                color: '#ffffff',
              },
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isParsed: false,
        };

        // Add the new presentation to the mock list
        mockPresentationItems = [{ ...presentation }, ...mockPresentationItems];

        const responses: PresentationGenerationResponse = {
          aiResult: mockSlides,
          presentation: presentation,
        };

        resolve(responses);
      }, 1000);
    });
  }

  async updatePresentationTitle(id: string, name: string): Promise<any | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockPresentationItems.findIndex((item) => item.id === id);
        if (index !== -1) {
          const isSuccess = Math.random() > 0.5;

          if (isSuccess) {
            mockPresentationItems[index].title = name;
            resolve(null);
          } else {
            resolve({
              success: false,
              message: 'Duplicated',
              code: 409,
              errorCode: 'CONFLICT',
              timestamp: Date.now(),
            });
          }
        } else {
          resolve({
            success: false,
            message: 'Presentation not found',
            code: 404,
            errorCode: 'NOT_FOUND',
            timestamp: Date.now(),
          });
        }
      }, 500);
    });
  }

  async updatePresentation(id: string, data: UpdatePresentationRequest): Promise<Presentation> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockPresentationItems.findIndex((item) => item.id === id);
        if (index !== -1) {
          const updatedPresentation = {
            ...mockPresentationItems[index],
            ...data,
            updatedAt: new Date().toISOString(),
          };
          mockPresentationItems[index] = updatedPresentation;
          resolve(updatedPresentation);
        } else {
          reject(new Error('Presentation not found'));
        }
      }, 500);
    });
  }

  getSlideThemes(params?: GetSlideThemesParams): Promise<SlideTheme[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const allThemes = Object.values(THEMES_DATA).filter(
          (theme): theme is SlideTheme => theme.id !== 'default'
        );

        // Simulate pagination
        if (params?.page && params?.pageSize) {
          const startIndex = (params.page - 1) * params.pageSize;
          const endIndex = startIndex + params.pageSize;
          resolve(allThemes.slice(startIndex, endIndex));
        } else {
          resolve(allThemes);
        }
      }, 300);
    });
  }

  getSlideTemplates(): Promise<SlideTemplate[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockSlideTemplates);
      }, 300);
    });
  }

  async draftPresentation(request: PresentationGenerateDraftRequest): Promise<Presentation> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    const draftPresentation: Presentation = {
      id: crypto.randomUUID(),
      title: 'AI Generated Presentation',
      slides: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isParsed: false,
      theme: request.presentation.theme,
      viewport: request.presentation.viewport,
    };

    // Add the draft presentation to the mock list
    mockPresentationItems = [draftPresentation, ...mockPresentationItems];

    return draftPresentation;
  }
}

const mockSlideData: SlideLayoutSchema[] = [];

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

const mockOutlineItems: OutlineItem[] = [
  {
    id: '1',
    markdownContent: `# Introduction to Web Development\r\n
      This slide covers the basics of web development including HTML, CSS, and JavaScript fundamentals.`,
  },
  {
    id: '2',
    markdownContent: `# Frontend Frameworks\r\n
      Overview of popular frontend frameworks like React, Vue, and Angular with their key features and use cases.`,
  },
  {
    id: '3',
    markdownContent: `# Backend Technologies\r\n
      Exploring server-side technologies including Node.js, Python, and database management systems.`,
  },
];

const mockSlideTemplates: SlideTemplate[] = [
  {
    id: 'title-slide',
    name: 'Title Slide',
    layout: 'title',
    config: { containers: {} },
    cover: '/templates/title-slide.png',
  },
  {
    id: 'content-slide',
    name: 'Content Slide',
    layout: 'list',
    config: { containers: {} },
    cover: '/templates/content-slide.png',
  },
  {
    id: 'two-column-slide',
    name: 'Two Column Slide',
    layout: 'two_column',
    config: { containers: {} },
    cover: '/templates/two-column-slide.png',
  },
];
