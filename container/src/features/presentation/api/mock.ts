import { API_MODE, type ApiMode } from '@/shared/constants';
import {
  type OutlineItem,
  type OutlineData,
  type PresentationApiService,
  type Presentation,
  type PresentationCollectionRequest,
} from '../types';
import type { ApiResponse } from '@/types/api';

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

const mockPresentationItems: Presentation[] = [];

const initMockPresentations = async () => {
  try {
    const responses = await Promise.all([
      fetch('/data/presentation.json'),
      fetch('/data/presentation2.json'),
    ]);
    const presentations = await Promise.all(responses.map((res) => res.json()));

    mockPresentationItems.push(...presentations);
  } catch (error) {
    // Silently handle fetch errors in test environment where public/data files don't exist
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

  getPresentations(_: PresentationCollectionRequest): Promise<ApiResponse<Presentation[]>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: [...mockPresentationItems],
          success: true,
          message: 'Mock presentations fetched successfully',
          code: 200,
        });
      }, 500);
    });
  }
}
