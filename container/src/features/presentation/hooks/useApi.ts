import { useQuery, useMutation, type UseQueryResult } from '@tanstack/react-query';
import type { SortingState, PaginationState, Updater } from '@tanstack/react-table';
import { usePresentationApiService } from '../api';
import { useEffect, useState } from 'react';
import type { Presentation, OutlineItem } from '../types';
import type { ApiResponse } from '@/shared/types/api';

// Return types for the hooks
export interface UsePresentationOutlinesReturn extends Omit<UseQueryResult<OutlineItem[]>, 'data'> {
  outlineItems: OutlineItem[];
}

export interface UsePresentationsReturn extends Omit<UseQueryResult<ApiResponse<Presentation[]>>, 'data'> {
  data: Presentation[];
  sorting: SortingState;
  setSorting: (updaterOrValue: Updater<SortingState>) => void;
  pagination: PaginationState;
  setPagination: (updaterOrValue: Updater<PaginationState>) => void;
  search: string;
  setSearch: (search: string) => void;
  totalItems: number;
}

export const usePresentationOutlines = (): UsePresentationOutlinesReturn => {
  const presentationApiService = usePresentationApiService();
  const { data: outlineItems = [], ...query } = useQuery<OutlineItem[]>({
    queryKey: [presentationApiService.getType(), 'presentationItems'],
    queryFn: async (): Promise<OutlineItem[]> => {
      const data = await presentationApiService.getOutlineItems();
      console.log('Fetch data', data);
      return data;
    },
  });

  return {
    outlineItems,
    ...query,
  };
};

export const usePresentations = (): UsePresentationsReturn => {
  const presentationApiService = usePresentationApiService();

  const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const [search, setSearch] = useState<string>('');

  const { data, ...query } = useQuery<ApiResponse<Presentation[]>>({
    queryKey: [presentationApiService.getType(), 'presentations', sorting, pagination, search],
    queryFn: async (): Promise<ApiResponse<Presentation[]>> => {
      const data = await presentationApiService.getPresentations({
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
        sort: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : undefined,
        filter: search.trim() || undefined,
      });
      return data;
    },
    enabled: true, // Always enabled
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 300000, // Keep in cache for 5 minutes
  });

  useEffect(() => {
    if (data && data.pagination) {
      setPagination((prev) => ({
        ...prev,
        pageIndex: data.pagination?.currentPage ?? 0,
        pageSize: data.pagination?.pageSize ?? 20,
      }));
    }
  }, [data?.pagination]);

  const handleSortingChange = (updaterOrValue: Updater<SortingState>) => {
    const newSorting = typeof updaterOrValue === 'function' ? updaterOrValue(sorting) : updaterOrValue;
    setSorting(newSorting);
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  };

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  };

  return {
    data: data?.data || [],
    sorting,
    setSorting: handleSortingChange,
    pagination,
    setPagination,
    search,
    setSearch: handleSearchChange,
    totalItems: data?.pagination?.totalItems || 0,
    ...query,
  };
};

export const useCreateTestPresentations = () => {
  const presentationApiService = usePresentationApiService(true);

  return useMutation({
    mutationFn: async () => {
      // Read from /public/data/{presentation.json|presentation-2.json}
      const responses = await Promise.all([
        fetch('/data/presentation.json'),
        fetch('/data/presentation2.json'),
      ]);
      const presentations = await Promise.all(responses.map((res) => res.json()));

      const createdPresentations = await Promise.all(
        presentations.map((presentation: any) => presentationApiService.createPresentation(presentation))
      );

      return createdPresentations;
    },
  });
};

export const useCreateBlankPresentation = () => {
  const presentationApiService = usePresentationApiService(true);

  return useMutation({
    mutationFn: async () => {
      const presentation = await presentationApiService.createPresentation({
        id: crypto.randomUUID(),
        title: 'Untitled Presentation',
        slides: [
          {
            id: 'w9LcNwETgw',
            elements: [],
            background: {
              type: 'solid',
              color: '#fff',
            },
          },
        ],
      });

      return { presentation };
    },
  });
};
