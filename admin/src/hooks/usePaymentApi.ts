import { getAdminApiService } from '@/api/admin';
import type { FinanceQueryParams, TransactionQueryParams } from '@/types/api';
import { useQuery } from '@tanstack/react-query';

export const paymentKeys = {
  transactions: {
    all: ['transactions'] as const,
    list: (params?: TransactionQueryParams) => [...paymentKeys.transactions.all, 'list', params] as const,
  },
  finance: {
    all: ['finance'] as const,
    revenue: (params: FinanceQueryParams) => [...paymentKeys.finance.all, 'revenue', params] as const,
    cost: (params: FinanceQueryParams) => [...paymentKeys.finance.all, 'cost', params] as const,
  },
};

export function useTransactions(params?: TransactionQueryParams) {
  return useQuery({
    queryKey: paymentKeys.transactions.list(params),
    queryFn: () => getAdminApiService().getTransactions(params),
    staleTime: 30000,
  });
}

export function useRevenueByDate(params: FinanceQueryParams) {
  return useQuery({
    queryKey: paymentKeys.finance.revenue(params),
    queryFn: () => getAdminApiService().getRevenueByDate(params),
    staleTime: 60000,
  });
}

export function useCostByDate(params: FinanceQueryParams) {
  return useQuery({
    queryKey: paymentKeys.finance.cost(params),
    queryFn: () => getAdminApiService().getCostByDate(params),
    staleTime: 60000,
  });
}
