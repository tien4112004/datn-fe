import { getAdminApiService } from '@/api/admin';
import type { CoinPackageCreateRequest, CoinPackageUpdateRequest } from '@/types/coinPackage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const coinPackageKeys = {
  all: ['coin-packages'] as const,
  list: () => [...coinPackageKeys.all, 'list'] as const,
  detail: (id: string) => [...coinPackageKeys.all, 'detail', id] as const,
};

export function useCoinPackages() {
  return useQuery({
    queryKey: coinPackageKeys.list(),
    queryFn: () => getAdminApiService().getCoinPackages(),
    staleTime: 30000,
    gcTime: 300000,
  });
}

export function useCreateCoinPackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CoinPackageCreateRequest) => getAdminApiService().createCoinPackage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coinPackageKeys.all });
      toast.success('Coin package created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create coin package', {
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    },
  });
}

export function useUpdateCoinPackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CoinPackageUpdateRequest }) =>
      getAdminApiService().updateCoinPackage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coinPackageKeys.all });
      toast.success('Coin package updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update coin package', {
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    },
  });
}

export function useDeleteCoinPackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => getAdminApiService().deleteCoinPackage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coinPackageKeys.all });
      toast.success('Coin package deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete coin package', {
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    },
  });
}

export function useToggleCoinPackageStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => getAdminApiService().toggleCoinPackageStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coinPackageKeys.all });
      toast.success('Coin package status updated');
    },
    onError: (error) => {
      toast.error('Failed to toggle coin package status', {
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    },
  });
}
