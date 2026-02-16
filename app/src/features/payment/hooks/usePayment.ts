import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPaymentApiService } from '../api';
import type { CheckoutRequest, TransactionDetails } from '../types';

export const paymentKeys = {
  all: ['payment'] as const,
  coinBalance: (userId: string) => [...paymentKeys.all, 'coinBalance', userId] as const,
  transactions: (page: number, size: number) => [...paymentKeys.all, 'transactions', page, size] as const,
  transaction: (id: string) => [...paymentKeys.all, 'transaction', id] as const,
  coinHistory: (userId: string, page: number, size: number) =>
    [...paymentKeys.all, 'coinHistory', userId, page, size] as const,
};

export const useCoinBalance = (userId?: string) => {
  const service = getPaymentApiService();

  return useQuery({
    queryKey: userId ? paymentKeys.coinBalance(userId) : paymentKeys.all,
    queryFn: async () => {
      if (!userId) throw new Error('Missing userId');
      return service.getUserCoin(userId);
    },
    staleTime: 30 * 1000,
    enabled: !!userId,
  });
};

export const useTransactions = (page = 1, size = 10) => {
  const service = getPaymentApiService();

  return useQuery({
    queryKey: paymentKeys.transactions(page, size),
    queryFn: () => service.getUserTransactions(page, size),
    staleTime: 15 * 1000,
  });
};

export const useTransaction = (transactionId?: string) => {
  const service = getPaymentApiService();

  return useQuery({
    queryKey: transactionId ? paymentKeys.transaction(transactionId) : paymentKeys.all,
    queryFn: async () => {
      if (!transactionId) throw new Error('Missing transactionId');
      return service.getTransaction(transactionId);
    },
    enabled: !!transactionId,
    refetchInterval: (query) => {
      const data = query.state.data as TransactionDetails | undefined;
      if (!data) return 2000;
      const finalStatuses = ['COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED'];
      return finalStatuses.includes(data.status) ? false : 2000;
    },
  });
};

export const useCoinHistory = (userId?: string, page = 0, size = 20) => {
  const service = getPaymentApiService();

  return useQuery({
    queryKey: userId ? paymentKeys.coinHistory(userId, page, size) : paymentKeys.all,
    queryFn: async () => {
      if (!userId) throw new Error('Missing userId');
      return service.getCoinHistory(userId, page, size);
    },
    staleTime: 30 * 1000,
    enabled: !!userId,
  });
};

export const useCreateCheckout = () => {
  const queryClient = useQueryClient();
  const service = getPaymentApiService();

  return useMutation({
    mutationFn: (request: CheckoutRequest) => service.createCheckout(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
    },
  });
};
