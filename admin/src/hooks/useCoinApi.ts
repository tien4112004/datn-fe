import { getAdminApiService } from '@/api/admin';
import type {
  CoinPricingCreateRequest,
  CoinPricingUpdateRequest,
  CoinPricingQueryParams,
} from '@/types/coin';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Query key factory for coin pricing API
 * Provides a hierarchical structure for cache management
 */
export const coinKeys = {
  pricing: {
    all: ['coin-pricing'] as const,
    list: (params?: CoinPricingQueryParams) => [...coinKeys.pricing.all, 'list', params] as const,
    detail: (id: string) => [...coinKeys.pricing.all, 'detail', id] as const,
  },
  resourceTypes: ['coin-pricing', 'resource-types'] as const,
  unitTypes: ['coin-pricing', 'unit-types'] as const,
};

// ============= COIN PRICING QUERIES =============

/**
 * Hook to fetch all coin pricing configurations
 */
export function useCoinPricing(params?: CoinPricingQueryParams) {
  return useQuery({
    queryKey: coinKeys.pricing.list(params),
    queryFn: () => getAdminApiService().getCoinPricing(params),
    staleTime: 30000,
    gcTime: 300000,
  });
}

/**
 * Hook to fetch a single coin pricing configuration by ID
 */
export function useCoinPricingById(id: string) {
  return useQuery({
    queryKey: coinKeys.pricing.detail(id),
    queryFn: () => getAdminApiService().getCoinPricingById(id),
    enabled: !!id,
    staleTime: 300000,
    gcTime: 600000,
  });
}

/**
 * Hook to fetch resource types enum
 */
export function useResourceTypes() {
  return useQuery({
    queryKey: coinKeys.resourceTypes,
    queryFn: () => getAdminApiService().getResourceTypes(),
    staleTime: 600000, // 10 minutes - enum values don't change often
    gcTime: 1200000,
  });
}

/**
 * Hook to fetch unit types enum
 */
export function useUnitTypes() {
  return useQuery({
    queryKey: coinKeys.unitTypes,
    queryFn: () => getAdminApiService().getUnitTypes(),
    staleTime: 600000,
    gcTime: 1200000,
  });
}

// ============= COIN PRICING MUTATIONS =============

/**
 * Hook to create a new coin pricing configuration
 */
export function useCreateCoinPricing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CoinPricingCreateRequest) => getAdminApiService().createCoinPricing(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coinKeys.pricing.all });
      toast.success('Coin pricing created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create coin pricing', {
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    },
  });
}

/**
 * Hook to update an existing coin pricing configuration
 */
export function useUpdateCoinPricing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CoinPricingUpdateRequest }) =>
      getAdminApiService().updateCoinPricing(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coinKeys.pricing.all });
      toast.success('Coin pricing updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update coin pricing', {
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    },
  });
}

/**
 * Hook to delete a coin pricing configuration
 */
export function useDeleteCoinPricing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => getAdminApiService().deleteCoinPricing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coinKeys.pricing.all });
      toast.success('Coin pricing deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete coin pricing', {
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    },
  });
}
