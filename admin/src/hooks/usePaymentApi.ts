import { getAdminApiService } from '@/api/admin';
import type { TransactionQueryParams } from '@/types/transaction';
import { useQuery } from '@tanstack/react-query';

export const paymentKeys = {
  transactions: {
    all: ['transactions'] as const,
    list: (params?: TransactionQueryParams) => [...paymentKeys.transactions.all, 'list', params] as const,
  },
};

export function useTransactions(params?: TransactionQueryParams) {
  return useQuery({
    queryKey: paymentKeys.transactions.list(params),
    queryFn: () => getAdminApiService().getAdminTransactions(params),
    staleTime: 30000,
  });
}
