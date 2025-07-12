import axios from './config';

// export const SERVER_URL = 'http://localhost:5000'
export const SERVER_URL = import.meta.env.MODE === 'development' ? '/api' : 'https://server.pptist.cn';
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

export default {
  getMockData(filename: string): Promise<any> {
    return axios.get(`${import.meta.env.VITE_BASE_URL}/mocks/${filename}.json`);
  },

  getFileData(filename: string): Promise<any> {
    return axios.get(`${import.meta.env.VITE_BASE_URL}/mocks/${filename}.json`);
  },

  AIPPT_Outline({ content, language, model }: AIPPTOutlinePayload): Promise<any> {
    return fetch(`${import.meta.env.VITE_BASE_URL}/mocks/AIPPT_Outline.md`);
  },

  AIPPT({ content, language, style, model }: AIPPTPayload): Promise<any> {
    return fetch(`${import.meta.env.VITE_BASE_URL}/mocks/AIPPT.json`);
  },
};
