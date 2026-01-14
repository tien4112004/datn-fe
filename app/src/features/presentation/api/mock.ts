import { API_MODE, type ApiMode } from '@aiprimary/api';
import {
  type PresentationApiService,
  type GetSlideThemesParams,
  type UpdatePresentationRequest,
  type ImageOptions,
  type OutlineData,
  type PresentationGenerateDraftRequest,
} from '../types';
import type { ApiResponse } from '@aiprimary/api';
import type {
  Presentation,
  PresentationCollectionRequest,
  SlideLayoutSchema,
  SlideTheme,
  SlideTemplate,
} from '@aiprimary/core';
import type { User, SharedUserApiResponse, ShareRequest, ShareResponse } from '../types/share';
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

  async getAiResultById(id: string): Promise<{
    slides: SlideLayoutSchema[];
    generationOptions?: ImageOptions;
  }> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (id === 'ai123') {
      return {
        slides: getMockSlideData(),
        generationOptions: {
          artStyle: 'digital-art',
          artStyleModifiers: 'vibrant colors, modern',
          imageModel: { name: 'dall-e-3', provider: 'openai' },
        },
      };
    } else {
      return { slides: [] };
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

  getType(): ApiMode {
    return API_MODE.mock;
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

  async deletePresentation(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockPresentationItems.findIndex((item) => item.id === id);
        if (index !== -1) {
          mockPresentationItems.splice(index, 1);
          resolve();
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

  getSlideThemesByIds(ids: string[]): Promise<SlideTheme[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (ids.length === 0) {
          resolve([]);
          return;
        }

        const allThemes = Object.values(THEMES_DATA).filter(
          (theme): theme is SlideTheme => theme.id !== undefined
        );

        // Filter themes by IDs and preserve order
        const themesById = new Map(allThemes.map((theme) => [theme.id, theme]));
        const filteredThemes = ids
          .map((id) => themesById.get(id))
          .filter((theme): theme is SlideTheme => theme !== undefined);

        resolve(filteredThemes);
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

  async sharePresentation(id: string, shareData: ShareRequest): Promise<ShareResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      resourceId: id,
      successCount: shareData.targetUserIds.length,
      failedCount: 0,
    };
  }

  async getSharedUsers(_id: string): Promise<SharedUserApiResponse[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockSharedUsers: SharedUserApiResponse[] = [
      {
        userId: '1',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        avatarUrl: 'https://i.pravatar.cc/150?img=1',
        permission: 'read',
      },
      {
        userId: '2',
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        avatarUrl: 'https://i.pravatar.cc/150?img=2',
        permission: 'comment',
      },
    ];

    return mockSharedUsers;
  }

  async revokeAccess(_presentationId: string, _userId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    // Mock implementation - no actual action needed
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

---

### How Does AI Actually Learn?

The secret ingredient is massive amounts of **data**! AI systems feed on information to become smarter.

**Data: The Brain Food of AI**

- **Machine Learning** is like teaching a computer to recognize patterns
- AI systems use **algorithms** to process and understand information
- Without quality data, AI cannot make good decisions

> Just like we learn from our mistakes, AI gets better with every example!

---### AI in Our Daily Lives

From your smartphone to your favorite streaming service, AI is everywhere working behind the scenes.

**Where Can You Find AI Today?**

- **Voice assistants** like Siri and Alexa understand what you say
- **Recommendation systems** suggest movies and music you might like
- **Navigation apps** find the fastest route to your destination

_AI is like having a super-smart friend who never sleeps and always wants to help!_
\`\`\``;

const mockSlideTemplates: SlideTemplate[] = [
  {
    id: 'title-slide',
    name: 'Title Slide',
    layout: 'title',
    containers: {},
    cover: '/templates/title-slide.png',
  },
  {
    id: 'content-slide',
    name: 'Content Slide',
    layout: 'list',
    containers: {},
    cover: '/templates/content-slide.png',
  },
  {
    id: 'two-column-slide',
    name: 'Two Column Slide',
    layout: 'two_column',
    containers: {},
    cover: '/templates/two-column-slide.png',
  },
];
