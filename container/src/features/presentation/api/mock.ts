import { API_MODE, type ApiMode } from '@/shared/constants';
import {
  type OutlineItem,
  type OutlineData,
  type PresentationApiService,
  type Presentation,
  type PresentationCollectionRequest,
  type PresentationGenerationRequest,
  type PresentationGenerationResponse,
} from '../types';
import type { ApiResponse } from '@/types/api';
import type { SlideData } from '../utils';

/**
 * Mock data for testing presentation generation
 * This matches the structure from the original handleClick function
 */
export const getMockSlideData = (): SlideData[] => [
  {
    type: 'title',
    data: {
      title: 'Presentation with really long title',
    },
  },
  {
    type: 'title',
    data: {
      title: 'Presentation with really long title',
      subtitle:
        'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    },
  },
  {
    type: 'two_column_with_image',
    title: 'Presentation',
    data: {
      items: [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ',
        'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. ',
      ],
      image: 'https://placehold.co/600x400',
    },
  },
  {
    type: 'two_column_with_big_image',
    title: 'Presentation',
    data: {
      items: [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ',
        'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. ',
      ],
      image: 'https://placehold.co/600x400',
    },
  },
  {
    type: 'main_image',
    data: {
      image: 'https://placehold.co/600x400',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    },
  },
  {
    type: 'two_column',
    data: {
      title: 'this is a title',
      items1: [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      ],
      items2: [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      ],
    },
  },
  {
    type: 'table_of_contents',
    data: {
      items: [
        'What & Why of Microservices',
        'Monolith vs Microservices',
        'Service Design Principles',
        'Communication & Data',
        'Deployment & Scaling',
        'Observability & Resilience',
        'Security & Governance',
        'Case Study & Q&A',
      ],
    },
  },
  {
    type: 'vertical_list',
    title: 'This is a title',
    data: {
      items: [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      ],
    },
  },
  {
    type: 'horizontal_list',
    title: 'Five Fundamentals of Microservices',
    data: {
      items: [
        {
          label: 'Boundaries',
          content: 'Define services around business capabilities and domains.',
        },
        {
          label: 'APIs',
          content: 'Use clear contracts (REST/gRPC) and versioning.',
        },
        {
          label: 'Data',
          content: 'Own your data; avoid shared databases.',
        },
        {
          label: 'Delivery',
          content: 'Automate CI/CD per service for rapid iteration.',
        },
        {
          label: 'Observe',
          content: 'Centralize logs, metrics, and traces for each service.',
        },
      ],
    },
  },
];

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
    htmlContent:
      '<div><h1>Introduction to Web Development</h1><p>This slide covers the basics of web development including HTML, CSS, and JavaScript fundamentals.</p></div>',
    markdownContent: `# Introduction to Web Development\r\n
      This slide covers the basics of web development including HTML, CSS, and JavaScript fundamentals.`,
  },
  {
    id: '2',
    htmlContent:
      '<div><h1>Frontend Frameworks</h1><p>Overview of popular frontend frameworks like React, Vue, and Angular with their key features and use cases.</p></div>',
    markdownContent: `# Frontend Frameworks\r\n
      Overview of popular frontend frameworks like React, Vue, and Angular with their key features and use cases.`,
  },
  {
    id: '3',
    htmlContent:
      '<div><h1>Backend Technologies</h1><p>Exploring server-side technologies including Node.js, Python, and database management systems.</p></div>',
    markdownContent: `# Backend Technologies\r\n
      Exploring server-side technologies including Node.js, Python, and database management systems.`,
  },
];

let mockPresentationItems: Presentation[] = [
  {
    id: 'ai123',
    title: 'AI Generated Presentation',
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

// Only initialize in non-test environments
if (typeof process === 'undefined' || process.env.NODE_ENV !== 'test') {
  initMockPresentations();
}

export default class PresentationMockService implements PresentationApiService {
  baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  async getAiResultById(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (id === 'ai123') {
          const slideData = {
            slides: getMockSlideData(),
          };
          resolve(slideData);
        } else {
          reject(new Error(`AI result not found for id: ${id}`));
        }
      }, 500);
    });
  }

  async *getStreamedOutline(_request: OutlineData, signal: AbortSignal): AsyncGenerator<string> {
    const chunks = mockOutlineOutput.split(' ');

    for (const chunk of chunks) {
      if (signal.aborted) {
        return;
      }

      yield chunk + ' ';
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  getType(): ApiMode {
    return API_MODE.mock;
  }

  async getPresentationItems(): Promise<Presentation[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockPresentationItems]), 500);
    });
  }

  async getOutlineItems(): Promise<OutlineItem[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockOutlineItems]), 500);
    });
  }

  async createPresentation(data: Presentation): Promise<Presentation> {
    return new Promise((resolve) => {
      const id = String(Date.now());
      mockPresentationItems.push({ ...data, id, isParsed: true });
      setTimeout(() => resolve({ ...data, id, isParsed: true }), 500);
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
}
