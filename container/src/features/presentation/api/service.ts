import { API_MODE, type ApiMode } from '@/shared/constants';
import {
  type PresentationApiService,
  type OutlineItem,
  type PresentationItem,
  type OutlinePromptRequest,
} from '../types';
import { splitMarkdownToOutlineItems } from '../utils';
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

  getStreamedOutline(request: OutlinePromptRequest, signal: AbortSignal): AsyncIterable<string> {
    return {
      async *[Symbol.asyncIterator]() {
        const response = await fetch('http://localhost:8080/api/ai/presentations/outline-generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/plain',
          },
          body: JSON.stringify(request),
          signal,
        });

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

  //   async getPresentationItems(): Promise<PresentationItem[]> {
  //     const response = await api.get<PresentationItem[]>('/presentation/items');
  //     return response.data;
  //   }

  getType(): ApiMode {
    return API_MODE.real;
  }

  async getPresentationItems(): Promise<PresentationItem[]> {
    console.warn('getPresentationItems is not implemented in PresentationRealApiService');
    await new Promise((resolve) => setTimeout(resolve, 50));
    // TODO: Implement real API call
    return [];
  }

  async getOutlineItems(): Promise<OutlineItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return splitMarkdownToOutlineItems(mockOutlineOutput);
  }
}
