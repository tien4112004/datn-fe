import { api, getBackendUrl, type ApiClient } from '@aiprimary/api';
import type { QuestionBankApiService } from '../types/questionBank';
import QuestionBankService from './questionBank.service';
import QuestionBankMockService from './questionBank.mock';

const USE_MOCK = import.meta.env.VITE_MOCK_QUESTION_BANK === 'true';

export const useQuestionBankApiService = (): QuestionBankApiService => {
  return new QuestionBankMockService(api, getBackendUrl());
  return new QuestionBankService(api, getBackendUrl());
};

export const getQuestionBankApiService = (apiClient: ApiClient = api): QuestionBankApiService => {
  return new QuestionBankMockService(apiClient, getBackendUrl());
  return new QuestionBankService(apiClient, getBackendUrl());
};
