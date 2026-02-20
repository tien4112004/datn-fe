import type { PaymentApiService } from '../types';
import PaymentService from './service';
import { api, type ApiClient } from '@aiprimary/api';
import { getBackendUrl } from '@/shared/utils/backend-url';

export const usePaymentApiService = (): PaymentApiService => {
  return new PaymentService(api, getBackendUrl());
};

export const getPaymentApiService = (apiClient: ApiClient = api): PaymentApiService => {
  return new PaymentService(apiClient, getBackendUrl());
};

export const createPaymentApiService = (apiClient: ApiClient, baseUrl?: string): PaymentApiService => {
  return new PaymentService(apiClient, baseUrl || getBackendUrl());
};
