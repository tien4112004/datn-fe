import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import type { SortingState, PaginationState, Updater } from '@tanstack/react-table';
import { useMindmapApiService } from '../api';
import { useEffect, useState } from 'react';
import type { MindmapData } from '../types/service';
import type { ApiResponse } from '@/shared/types/api';
import { ExpectedError } from '@/types/errors';

// Return types for the hooks
export interface UseMindmapsReturn extends Omit<UseQueryResult<ApiResponse<MindmapData[]>>, 'data'> {
  data: MindmapData[];
  sorting: SortingState;
  setSorting: (updaterOrValue: Updater<SortingState>) => void;
  pagination: PaginationState;
  setPagination: (updaterOrValue: Updater<PaginationState>) => void;
  search: string;
  setSearch: (search: string) => void;
  totalItems: number;
}

export const useMindmaps = (): UseMindmapsReturn => {
  const mindmapApiService = useMindmapApiService();

  const [sorting, setSorting] = useState<SortingState>([{ id: 'updatedAt', desc: true }]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const [search, setSearch] = useState<string>('');

  const { data, ...query } = useQuery<ApiResponse<MindmapData[]>>({
    queryKey: [mindmapApiService.getType(), 'mindmaps', sorting, pagination, search],
    queryFn: async (): Promise<ApiResponse<MindmapData[]>> => {
      const data = await mindmapApiService.getMindmaps({
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

export const useMindmapById = (id: string | undefined) => {
  const mindmapApiService = useMindmapApiService();

  return useQuery<MindmapData>({
    queryKey: [mindmapApiService.getType(), 'mindmap', id],
    queryFn: async (): Promise<MindmapData> => {
      if (!id) {
        throw new ExpectedError('Mindmap ID is required');
      }
      const mindmap = await mindmapApiService.getMindmapById(id);
      if (!mindmap) {
        throw new ExpectedError('Mindmap not found');
      }
      return mindmap;
    },
    enabled: !!id, // Only run the query if id is provided
  });
};

export const useUpdateMindmapTitle = () => {
  const mindmapApiService = useMindmapApiService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const result = await mindmapApiService.updateMindmapTitle(id, name);

      const CONFLICT_HTTP_STATUS = 409;
      if (result && typeof result === 'object' && 'code' in result) {
        if (result.code === CONFLICT_HTTP_STATUS) {
          throw new Error('A mindmap with this name already exists');
        }

        throw new Error(result.message || 'An error occurred');
      }

      return { id, name, result };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [mindmapApiService.getType(), 'mindmaps'],
      });

      queryClient.invalidateQueries({
        queryKey: [mindmapApiService.getType(), 'mindmap', data.id],
      });
    },
  });
};

export const useCreateBlankMindmap = () => {
  const mindmapApiService = useMindmapApiService();

  return useMutation({
    mutationFn: async () => {
      const mindmap = await mindmapApiService.createMindmap({
        id: crypto.randomUUID(),
        title: 'Untitled Mindmap',
        description: '',
        nodes: [
          {
            id: 'root',
            type: 'mindmapRootNode',
            position: { x: 0, y: 0 },
            data: {
              level: 0,
              content: '<p>Central Topic</p>',
              side: 'mid',
              isCollapsed: false,
              pathType: 'smoothstep',
              edgeColor: 'var(--primary)',
            },
            dragHandle: '.drag-handle',
            width: 250,
            height: 100,
          },
        ],
        edges: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'draft',
      });

      return { mindmap };
    },
  });
};
