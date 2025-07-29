import { API_MODE, type ApiMode } from '@/shared/constants';
import type { ModelApiService, ModelOption } from '../types';

const mockModels: ModelOption[] = [
  { id: 'gpt-4o-mini', name: 'gpt-4o-mini', displayName: 'GPT-4o Mini' },
  { id: 'gemini-2.0-flash', name: 'gemini-2.0-flash', displayName: 'Gemini 2.0 Flash' },
];

export default class ModelMockService implements ModelApiService {
  getType(): ApiMode {
    return API_MODE.mock;
  }

  async getAvailableModels(): Promise<ModelOption[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockModels]), 300);
    });
  }
}
