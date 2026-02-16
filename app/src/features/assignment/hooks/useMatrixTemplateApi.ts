import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMatrixTemplateApiService } from '../api/matrixTemplate.index';
import type { MatrixTemplateFilters } from '../types/matrixTemplate';

// Export the API service hook for direct use
export { useMatrixTemplateApiService } from '../api/matrixTemplate.index';

// Query key factory
export const matrixTemplateKeys = {
  all: ['matrix-templates'] as const,
  lists: () => [...matrixTemplateKeys.all, 'list'] as const,
  list: (filters: MatrixTemplateFilters) => [...matrixTemplateKeys.lists(), filters] as const,
  infiniteLists: () => [...matrixTemplateKeys.all, 'infinite-list'] as const,
  infiniteList: (filters: Omit<MatrixTemplateFilters, 'page' | 'pageSize'>) =>
    [...matrixTemplateKeys.infiniteLists(), filters] as const,
  details: () => [...matrixTemplateKeys.all, 'detail'] as const,
  detail: (id: string) => [...matrixTemplateKeys.details(), id] as const,
};

const TEMPLATE_PAGE_SIZE = 10;

// GET all templates with infinite scrolling
export const useInfiniteMatrixTemplateList = (
  filters: Omit<MatrixTemplateFilters, 'page' | 'pageSize'> = {}
) => {
  const apiService = useMatrixTemplateApiService();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useInfiniteQuery({
    queryKey: matrixTemplateKeys.infiniteList(filters),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiService.getTemplates({
        ...filters,
        page: pageParam,
        pageSize: TEMPLATE_PAGE_SIZE,
      });
      return {
        templates: response.data,
        pagination: response.pagination,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: { templates: any[]; pagination?: any }) => {
      const pagination = lastPage.pagination;
      if (!pagination) return undefined;
      if (pagination.currentPage >= pagination.totalPages) return undefined;
      return pagination.currentPage + 1;
    },
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
  });

  const templates = data?.pages.flatMap((page: { templates: any[] }) => page.templates) || [];

  return {
    templates,
    fetchNextPage,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    isLoading,
    isError,
  };
};

// GET single template by ID
export const useMatrixTemplate = (id: string | undefined) => {
  const apiService = useMatrixTemplateApiService();

  return useQuery({
    queryKey: matrixTemplateKeys.detail(id || ''),
    queryFn: () => apiService.getTemplateById(id!),
    enabled: !!id,
  });
};

// CREATE template
export const useCreateMatrixTemplate = () => {
  const apiService = useMatrixTemplateApiService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiService.createTemplate.bind(apiService),
    onSuccess: () => {
      // Invalidate all list queries to refetch
      queryClient.invalidateQueries({ queryKey: matrixTemplateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: matrixTemplateKeys.infiniteLists() });
    },
  });
};

// UPDATE template
export const useUpdateMatrixTemplate = () => {
  const apiService = useMatrixTemplateApiService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: any }) => apiService.updateTemplate(id, request),
    onSuccess: (_data: any, variables: { id: string; request: any }) => {
      // Invalidate lists and specific detail
      queryClient.invalidateQueries({ queryKey: matrixTemplateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: matrixTemplateKeys.infiniteLists() });
      queryClient.invalidateQueries({ queryKey: matrixTemplateKeys.detail(variables.id) });
    },
  });
};

// DELETE template
export const useDeleteMatrixTemplate = () => {
  const apiService = useMatrixTemplateApiService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiService.deleteTemplate(id),
    onSuccess: () => {
      // Invalidate all list queries to refetch
      queryClient.invalidateQueries({ queryKey: matrixTemplateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: matrixTemplateKeys.infiniteLists() });
    },
  });
};
