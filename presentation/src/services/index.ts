import { getBaseUrl } from '@/utils/base-url';
import { api, getBackendUrl } from '@aiprimary/api';

// export const SERVER_URL = 'http://localhost:5000'
export const SERVER_URL = getBackendUrl();
export const ASSET_URL = 'https://asset.pptist.cn';

interface ImageSearchPayload {
  query: string;
  orientation?: 'landscape' | 'portrait' | 'square' | 'all';
  locale?: 'zh' | 'en';
  order?: 'popular' | 'latest';
  size?: 'large' | 'medium' | 'small';
  image_type?: 'all' | 'photo' | 'illustration' | 'vector';
  page?: number;
  per_page?: number;
}

interface AIPPTOutlinePayload {
  content: string;
  language: string;
  model: string;
}

interface AIPPTPayload {
  content: string;
  language: string;
  style: string;
  model: string;
}

interface AIWritingPayload {
  content: string;
  command: string;
}

export default {
  async getMockData(filename: string): Promise<any> {
    const response = await api.get(`${getBaseUrl()}/mocks/${filename}.json`);
    return response.data;
  },

  async getFileData(filename: string): Promise<any> {
    const response = await api.get(`${getBaseUrl()}/mocks/${filename}.json`);
    return response.data;
  },

  async searchImage(body: ImageSearchPayload): Promise<any> {
    try {
      const response = await api.post(`${SERVER_URL}/images/search-pexels`, body);
      return response.data;
    } catch (error: any) {
      // Handle rate limit from Pexels API
      if (error.response?.status === 502) {
        throw new Error('Image search service is temporarily unavailable. Please try again later.');
      }
      throw error;
    }
  },

  async getMyImages(page: number = 1, size: number = 20): Promise<any> {
    try {
      const response = await api.get(`${SERVER_URL}/images`, {
        params: { page, size },
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  AIPPT_Outline({ content, language, model }: AIPPTOutlinePayload): Promise<any> {
    return fetch(`${getBaseUrl()}/mocks/AIPPT_Outline.md`);
  },

  AIPPT({ content, language, style, model }: AIPPTPayload): Promise<any> {
    return fetch(`${getBaseUrl()}/mocks/AIPPT.json`);
  },

  AI_Writing({ content, command }: AIWritingPayload): Promise<any> {
    // Create a mock streaming response
    const mockResponse =
      content +
      '\n\n' +
      `[AI ${command}]: This is a simulated AI response. The original content has been processed.`;

    // Simulate streaming by splitting the response into chunks
    const chunks = mockResponse.split('');
    let currentIndex = 0;

    const stream = new ReadableStream({
      start(controller) {
        const interval = setInterval(() => {
          if (currentIndex < chunks.length) {
            controller.enqueue(new TextEncoder().encode(chunks[currentIndex]));
            currentIndex++;
          } else {
            clearInterval(interval);
            controller.close();
          }
        }, 50); // Send one character every 50ms to simulate streaming
      },
    });

    return Promise.resolve(new Response(stream));
  },
};
