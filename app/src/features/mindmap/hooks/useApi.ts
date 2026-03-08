import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import type { SortingState, PaginationState, Updater } from '@tanstack/react-table';
import { useMindmapApiService } from '../api';
import { useEffect } from 'react';
import type { Mindmap } from '../types';
import type { ApiResponse } from '@aiprimary/api';
import { ExpectedError } from '@aiprimary/api';
import { useMetadataStore } from '../stores';
import { useCoreStore } from '../stores/core';
import { getTreeLayoutType, getTreeForceLayout } from '../services/utils';
import { t } from 'i18next';
import { toast } from 'sonner';
import { getExamplePromptsApiService, type UpdateChapterPayload } from '@/features/projects/api';
import type { DocumentFilterValues } from '@/features/projects/components/DocumentFilters';
import { useMindmapListStore } from '../stores/useMindmapListStore';

/**
 * Convert data URL (base64) to Blob for multipart upload
 */
function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

// Return types for the hooks
export interface UseMindmapsReturn extends Omit<UseQueryResult<ApiResponse<Mindmap[]>>, 'data'> {
  data: Mindmap[];
  sorting: SortingState;
  setSorting: (updaterOrValue: Updater<SortingState>) => void;
  pagination: PaginationState;
  setPagination: (updaterOrValue: Updater<PaginationState>) => void;
  search: string;
  setSearch: (search: string) => void;
  totalItems: number;
  documentFilters: DocumentFilterValues;
  setDocumentFilters: (filters: DocumentFilterValues) => void;
}

export const useMindmaps = (): UseMindmapsReturn => {
  const mindmapApiService = useMindmapApiService();

  const {
    search,
    sorting,
    pagination,
    documentFilters,
    setSearch,
    setSorting,
    setPagination,
    setDocumentFilters,
  } = useMindmapListStore();

  const { data, ...query } = useQuery<ApiResponse<Mindmap[]>>({
    queryKey: [mindmapApiService.getType(), 'mindmaps', sorting, pagination, search, documentFilters],
    queryFn: async (): Promise<ApiResponse<Mindmap[]>> => {
      const data = await mindmapApiService.getMindmaps({
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
        sort: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : undefined,
        filter: search.trim() || undefined,
        grade: documentFilters.grade,
        subject: documentFilters.subject,
        chapter: documentFilters.chapter,
      });
      return data;
    },
    enabled: true,
    staleTime: 30000,
    gcTime: 300000,
  });

  useEffect(() => {
    if (data && data.pagination) {
      setPagination({
        pageIndex: data.pagination?.currentPage ?? 0,
        pageSize: data.pagination?.pageSize ?? 20,
      });
    }
  }, [data?.pagination]);

  const handleSortingChange = (updaterOrValue: Updater<SortingState>) => {
    const newSorting = typeof updaterOrValue === 'function' ? updaterOrValue(sorting) : updaterOrValue;
    setSorting(newSorting);
  };

  return {
    data: data?.data || [],
    sorting,
    setSorting: handleSortingChange,
    pagination,
    setPagination,
    search,
    setSearch,
    totalItems: data?.pagination?.totalItems || 0,
    documentFilters,
    setDocumentFilters,
    ...query,
  };
};

export const useMindmapById = (id: string | undefined) => {
  const mindmapApiService = useMindmapApiService();

  return useQuery<Mindmap>({
    queryKey: [mindmapApiService.getType(), 'mindmap', id],
    queryFn: async (): Promise<Mindmap> => {
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
      await mindmapApiService.updateMindmapTitle(id, name);
      return { id, name };
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
        title: t('mindmap:list.untitledMindmap'),
        description: '',
        nodes: [],
        edges: [],
      });

      return { mindmap };
    },
  });
};

export const useDuplicateMindmap = () => {
  const mindmapApiService = useMindmapApiService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // 1. Fetch the existing mindmap
      const original = await mindmapApiService.getMindmapById(id);

      // 2. Transform data for duplication
      const duplicateData = {
        title: `${original.title} (Copy)`,
        description: original.description || '',
        nodes: original.nodes,
        edges: original.edges,
        metadata: original.metadata,
        thumbnail: original.thumbnail,
      };

      // 3. Create new mindmap using existing POST endpoint
      const duplicated = await mindmapApiService.createMindmap(duplicateData);

      return duplicated;
    },
    onSuccess: (data) => {
      // Invalidate queries to refresh list
      queryClient.invalidateQueries({
        queryKey: [mindmapApiService.getType(), 'mindmaps'],
      });

      toast.success(t('mindmap:toolbar.actions.duplicateSuccess', { title: data.title }));
    },
    onError: (error) => {
      toast.error(t('mindmap:toolbar.actions.duplicateError'));
      console.error('Failed to duplicate mindmap:', error);
    },
  });
};

export const useUpdateMindmapWithMetadata = () => {
  const mindmapApiService = useMindmapApiService();
  const queryClient = useQueryClient();
  const getThumbnail = useMetadataStore((state) => state.getThumbnail);
  const nodes = useCoreStore((state) => state.nodes);

  return useMutation({
    mutationFn: async ({
      id,
      data,
      viewport,
    }: {
      id: string;
      data: Partial<Mindmap>;
      viewport?: { x: number; y: number; zoom: number };
    }) => {
      // Get layout data from root node
      const layoutType = getTreeLayoutType(nodes);
      const forceLayout = getTreeForceLayout(nodes);

      const updateData: Partial<Mindmap> = {
        ...data,
      };

      // Include layoutType, auto layout state, and viewport in metadata
      // The layout data is stored in root node, but we also save to metadata for backward compatibility
      updateData.metadata = {
        layoutType,
        forceLayout,
        ...(viewport && { viewport }),
      };

      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('data', new Blob([JSON.stringify(updateData)], { type: 'application/json' }));

      // Convert thumbnail to Blob
      const thumbnail = getThumbnail();
      if (thumbnail) {
        const blob = dataURLtoBlob(thumbnail);
        formData.append('file', blob, 'thumbnail.png');
      }

      const result = await mindmapApiService.updateMindmap(id, formData);
      return { id, data: result };
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

export const useDeleteMindmap = () => {
  const mindmapApiService = useMindmapApiService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await mindmapApiService.deleteMindmap(id);
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries({
        queryKey: [mindmapApiService.getType(), 'mindmaps'],
      });

      queryClient.removeQueries({
        queryKey: [mindmapApiService.getType(), 'mindmap', deletedId],
      });
    },
  });
};

// Removed: Test mindmap creation hook (not needed for production)
// export const useCreateTestMindmaps = () => {
//   const mindmapApiService = useMindmapApiService();
//
//   return useMutation({
//     mutationFn: async () => {
//       // Read from /public/data/mindmap.json
//       const response = await fetch('/data/mindmap.json');
//       const mindmap = await response.json();
//
//       const createdMindmap = await mindmapApiService.createMindmap(mindmap);
//
//       return createdMindmap;
//     },
//   });
// };

export const useGenerateMindmap = () => {
  const mindmapApiService = useMindmapApiService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: import('../types/service').MindmapGenerateRequest) => {
      return await mindmapApiService.generateMindmap(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [mindmapApiService.getType(), 'mindmaps'],
      });
    },
  });
};

export const useUpdateMindmapChapter = () => {
  const mindmapApiService = useMindmapApiService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & UpdateChapterPayload) => {
      await getExamplePromptsApiService().updateDocumentChapter('mindmap', id, payload);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [mindmapApiService.getType(), 'mindmaps'],
      });
    },
  });
};
