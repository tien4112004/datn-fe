import { getBackendUrl } from '@aiprimary/api';
import type { QuestionBankApiService } from '../types/questionBank';
import QuestionBankMockApiService from './questionBank.mock';
import QuestionBankRealApiService from './questionBank.service';

// Simple API mode detection based on environment variable
const getApiMode = (): 'mock' | 'real' => {
  const mode = import.meta.env.VITE_API_MODE === 'real' ? 'real' : 'mock';
  console.log('[Question Bank API] Mode:', mode, '| VITE_API_MODE:', import.meta.env.VITE_API_MODE);
  return mode;
};

export const useQuestionBankApiService = (): QuestionBankApiService => {
  const baseUrl = getBackendUrl();
  const apiMode = getApiMode();

  if (apiMode === 'mock') {
    console.log('[Question Bank API] Using MOCK service');
    return new QuestionBankMockApiService(baseUrl);
  }
  console.log('[Question Bank API] Using REAL service | Base URL:', baseUrl);
  return new QuestionBankRealApiService(baseUrl);
};

export const getQuestionBankApiService = (): QuestionBankApiService => {
  return useQuestionBankApiService();
};
