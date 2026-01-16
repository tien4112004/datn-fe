import { api, getBackendUrl, type ApiClient } from '@aiprimary/api';
import type { QuestionBankApiService } from '../types/questionBank';
import QuestionBankService from './questionBank.service';

export const useQuestionBankApiService = (): QuestionBankApiService => {
  return new QuestionBankService(api, getBackendUrl());
};

export const getQuestionBankApiService = (apiClient: ApiClient = api): QuestionBankApiService => {
  return new QuestionBankService(apiClient, getBackendUrl());
};
