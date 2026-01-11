import { getBackendUrl } from '@aiprimary/api';
import type { QuestionBankApiService } from '../types/questionBank';
import QuestionBankMockApiService from './questionBank.mock';
import QuestionBankRealApiService from './questionBank.service';

// Simple API mode detection based on environment variable
const getApiMode = (): 'mock' | 'real' => {
  return import.meta.env.VITE_API_MODE === 'real' ? 'real' : 'mock';
};

export const useQuestionBankApiService = (): QuestionBankApiService => {
  const baseUrl = getBackendUrl();
  const apiMode = getApiMode();

  if (apiMode === 'mock') {
    return new QuestionBankMockApiService(baseUrl);
  }
  return new QuestionBankRealApiService(baseUrl);
};

export const getQuestionBankApiService = (): QuestionBankApiService => {
  return useQuestionBankApiService();
};
