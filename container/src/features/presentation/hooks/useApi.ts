import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import type { SortingState, PaginationState, Updater } from '@tanstack/react-table';
import { usePresentationApiService } from '../api';
import { useImageApiService } from '@/features/image/api';
import { useEffect, useState } from 'react';
import type { Presentation, OutlineItem, PresentationGenerationRequest } from '../types';
import type { ApiResponse } from '@/shared/types/api';
import { ExpectedError } from '@/types/errors';
import type { Slide } from '../types/slide';

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

/**
 * @deprecated
 */
export const usePresentationOutlines = (): UsePresentationOutlinesReturn => {
  const presentationApiService = usePresentationApiService();
  const { data: outlineItems = [], ...query } = useQuery<OutlineItem[]>({
    queryKey: [presentationApiService.getType(), 'outlineItems'],
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

export const usePresentationById = (id: string | undefined) => {
  const presentationApiService = usePresentationApiService();

  return useQuery<Presentation>({
    queryKey: [presentationApiService.getType(), 'presentation', id],
    queryFn: async (): Promise<Presentation> => {
      if (!id) {
        throw new ExpectedError('Presentation ID is required');
      }
      const presentation = await presentationApiService.getPresentationById(id);
      if (!presentation) {
        throw new ExpectedError('Presentation not found');
      }
      return presentation;
    },
    enabled: !!id, // Only run the query if id is provided
  });
};

export const useCreateTestPresentations = () => {
  const presentationApiService = usePresentationApiService();

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
  const presentationApiService = usePresentationApiService();
  const queryClient = useQueryClient();

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
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: [presentationApiService.getType(), 'presentations'],
      });
    },
  });
};

export const useGeneratePresentation = () => {
  const presentationApiService = usePresentationApiService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: PresentationGenerationRequest) => {
      const generatedSlides = await presentationApiService.generatePresentation(request);
      return generatedSlides;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [presentationApiService.getType(), 'presentations'],
      });
    },
  });
};

export const useAiResultById = (id: string) => {
  const presentationApiService = usePresentationApiService();

  return useMutation({
    mutationFn: async () => {
      const aiResult = await presentationApiService.getAiResultById(id);
      return aiResult;
    },
  });
};

export const useUpdatePresentationTitle = () => {
  const presentationApiService = usePresentationApiService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const result = await presentationApiService.updatePresentationTitle(id, name);

      const CONFLICT_HTTP_STATUS = 409;
      if (result && typeof result === 'object' && 'code' in result) {
        if (result.code === CONFLICT_HTTP_STATUS) {
          throw new Error('A presentation with this name already exists');
        }

        throw new Error(result.message || 'An error occurred');
      }

      return { id, name, result };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [presentationApiService.getType(), 'presentations'],
      });

      queryClient.invalidateQueries({
        queryKey: [presentationApiService.getType(), 'presentation', data.id],
      });
    },
    // onError: (error: unknown) => {
    //   console.error('Failed to update presentation title:', error);
    //   throw error;
    // },
  });
};

export const useUpdatePresentationSlides = (id: string) => {
  const presentationApiService = usePresentationApiService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slides: Slide[]) => {
      // Use multiple single slide updates for batch operations
      let updatedPresentation: Presentation;

      for (const slide of slides) {
        updatedPresentation = await presentationApiService.upsertPresentationSlide(id, slide);
      }

      return updatedPresentation!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [presentationApiService.getType(), 'presentation', id],
      });
    },
  });
};

export const useSetParsedPresentation = (id: string) => {
  const presentationApiService = usePresentationApiService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const updatedPresentation = await presentationApiService.setPresentationAsParsed(id);
      return updatedPresentation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [presentationApiService.getType(), 'presentation', id],
      });
    },
  });
};

export const useGeneratePresentationImage = (id: string) => {
  const imageApiService = useImageApiService();
  const presentationApiService = usePresentationApiService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      slideId,
      elementId,
      prompt,
      model,
    }: {
      slideId: string;
      elementId: string;
      prompt: string;
      model: {
        name: string;
        provider: string;
      };
    }) => {
      const imageUrl = await imageApiService.generatePresentationImage(id, slideId, elementId, {
        prompt,
        model,
      });
      return imageUrl;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [presentationApiService.getType(), 'presentation', id],
      });
    },
  });
};
