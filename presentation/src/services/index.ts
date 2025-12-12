import axios from './config';
import { getBackendUrl } from '@aiprimary/api';

// export const SERVER_URL = 'http://localhost:5000'
export const SERVER_URL = getBackendUrl();
export const ASSET_URL = 'https://asset.pptist.cn';

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

import { getBaseUrl } from '@/utils/base-url';

export default {
  getMockData(filename: string): Promise<any> {
    return axios.get(`${getBaseUrl()}/mocks/${filename}.json`);
  },

  getFileData(filename: string): Promise<any> {
    return axios.get(`${getBaseUrl()}/mocks/${filename}.json`);
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
