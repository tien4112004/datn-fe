import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  type UseQueryResult,
} from '@tanstack/react-query';
import type { SortingState, PaginationState, Updater } from '@tanstack/react-table';
import { usePresentationApiService, getPresentationApiService } from '../api';
import { useImageApiService } from '@/features/image/api';
import { useEffect, useState } from 'react';
import type { Presentation, PresentationGenerateDraftRequest, UpdatePresentationRequest } from '../types';
import type { ApiResponse } from '@aiprimary/api';
import { ExpectedError } from '@aiprimary/api';
import type { SlideTemplate, SlideTheme } from '../types/slide';
import { toast } from 'sonner';
import { t } from 'i18next';

// Return types for the hooks
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

// Removed: Test presentation creation hook (not needed for production)
// export const useCreateTestPresentations = () => {
//   const presentationApiService = usePresentationApiService();
//
//   return useMutation({
//     mutationFn: async () => {
//       // Read from /public/data/{presentation.json|presentation-2.json}
//       const responses = await Promise.all([
//         fetch('/data/presentation.json'),
//         fetch('/data/presentation2.json'),
//       ]);
//       const presentations = await Promise.all(responses.map((res) => res.json()));
//
//       const createdPresentations = await Promise.all(
//         presentations.map((presentation: any) => presentationApiService.createPresentation(presentation))
//       );
//
//       return createdPresentations;
//     },
//   });
// };

export const useCreateBlankPresentation = () => {
  const presentationApiService = usePresentationApiService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const presentation = await presentationApiService.createPresentation({
        title: t('presentation:list.untitledPresentation'),
        isParsed: true,
        slides: [
          {
            id: crypto.randomUUID(),
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
        if ((result as { code: number }).code === CONFLICT_HTTP_STATUS) {
          throw new Error(t('common:table.presentation.renameDuplicatedMessage'));
        }

        throw new Error((result as { message?: string }).message || 'An error occurred');
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

      toast.success(
        t('common:table.presentation.renameSuccess', {
          filename: data.name,
        })
      );
    },
  });
};

export const useUpdatePresentation = (id: string) => {
  const presentationApiService = usePresentationApiService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (presentation: UpdatePresentationRequest) => {
      const updatedPresentation = await presentationApiService.updatePresentation(id, presentation);
      return updatedPresentation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [presentationApiService.getType(), 'presentations'],
      });

      queryClient.invalidateQueries({
        queryKey: [presentationApiService.getType(), 'presentation', id],
      });

      toast.success(t('common:presentation.saveSuccess'));
    },
    onError: (error: Error) => {
      console.error('Failed to save presentation:', error);
      toast.error(t('common:presentation.saveFailed'));
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
        model: model.name,
        provider: model.provider,
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

export const useSlideThemes = () => {
  const { data: themes, ...query } = useQuery<SlideTheme[]>({
    queryKey: ['slideThemes'],
    queryFn: async () => {
      const apiService = getPresentationApiService();
      return apiService.getSlideThemes();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
  });

  return {
    themes: themes ?? [],
    defaultTheme: themes?.find((t) => t.id === 'default') || themes?.[0],
    ...query,
  };
};

export const useRecentSlideThemes = (themeIds: string[]) => {
  const { data: themes, ...query } = useQuery<SlideTheme[]>({
    queryKey: ['slideThemes', 'recent', themeIds],
    queryFn: async () => {
      if (themeIds.length === 0) {
        return [];
      }
      try {
        const apiService = getPresentationApiService();
        return await apiService.getSlideThemesByIds(themeIds);
      } catch (error) {
        console.warn('Failed to fetch recent themes by IDs:', error);
        // Return empty array on error to prevent cascading failures
        return [];
      }
    },
    enabled: themeIds.length > 0,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes (longer than regular themes)
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    retry: false, // Don't retry if specific IDs fail
  });

  return {
    recentThemes: themes ?? [],
    ...query,
  };
};

const PAGE_SIZE = 12;

export const useInfiniteSlideThemes = () => {
  const { data, ...query } = useInfiniteQuery({
    queryKey: ['slideThemes', 'infinite'],
    queryFn: async ({ pageParam = 0 }): Promise<SlideTheme[]> => {
      const apiService = getPresentationApiService();
      const themes = await apiService.getSlideThemes({
        page: pageParam as number,
        pageSize: PAGE_SIZE,
      });
      return themes;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: SlideTheme[], allPages: SlideTheme[][]) => {
      // If the last page has fewer items than the page size, we've reached the end
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  const themes = data?.pages.flatMap((page: SlideTheme[]) => page) || [];

  return {
    themes,
    defaultTheme: themes.find((t: SlideTheme) => t.id === 'default') || themes[0],
    ...query,
  };
};

export const useSlideTemplates = () => {
  const { data: templates, ...query } = useQuery<SlideTemplate[]>({
    queryKey: ['slideTemplates'],
    queryFn: async () => {
      const apiService = getPresentationApiService();
      return apiService.getSlideTemplates();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    templates: templates || [],
    ...query,
  };
};

export const useDraftPresentation = () => {
  const presentationApiService = usePresentationApiService();

  return useMutation({
    mutationFn: async (request: PresentationGenerateDraftRequest) => {
      const title = request.topic || 'AI Generated Presentation';
      const draftPresentation = await presentationApiService.createPresentation({
        title,
        isParsed: false,
        slides: [],
        ...request.presentation,
      });
      return draftPresentation;
    },
  });
};

export const useDeletePresentation = () => {
  const presentationApiService = usePresentationApiService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await presentationApiService.deletePresentation(id);
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries({
        queryKey: [presentationApiService.getType(), 'presentations'],
      });

      queryClient.removeQueries({
        queryKey: [presentationApiService.getType(), 'presentation', deletedId],
      });
    },
  });
};
