import { API_MODE, type ApiMode } from '@/shared/constants';
import type { ModelApiService, ModelOption } from '../types';

const mockModels: ModelOption[] = [
  {
    id: 'gpt-4.1-nano-2025-04-14',
    name: 'gpt-4.1-nano-2025-04-14',
    displayName: 'GPT-4.1 Nano',
    enabled: true,
    default: true,
    provider: 'OpenAI',
  },
  {
    id: 'gpt-4o-mini-2024-07-18',
    name: 'gpt-4o-mini-2024-07-18',
    displayName: 'GPT-4o Mini',
    enabled: true,
    default: false,
    provider: 'OpenAI',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'gemini-2.5-flash',
    displayName: 'Gemini 2.5 Flash',
    enabled: false,
    default: false,
    provider: 'Google',
  },
];

export default class ModelMockService implements ModelApiService {
  getType(): ApiMode {
    return API_MODE.mock;
  }

  async getModels(): Promise<ModelOption[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockModels]), 300);
    });
  }

  async getDefaultModel(): Promise<ModelOption> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockModels[0]), 300);
    });
  }
}
