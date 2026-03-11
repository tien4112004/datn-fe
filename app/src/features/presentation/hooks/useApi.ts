import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  type UseQueryResult,
} from '@tanstack/react-query';
import type { SortingState, PaginationState, Updater } from '@tanstack/react-table';
import { usePresentationApiService, getPresentationApiService } from '../api';
import { useEffect } from 'react';
import type { Presentation, PresentationGenerateDraftRequest } from '../types';
import type { ApiResponse } from '@aiprimary/api';
import type { SlideTheme } from '../types/slide';
import { toast } from 'sonner';
import { t } from 'i18next';
import { getExamplePromptsApiService, type UpdateChapterPayload } from '@/features/projects/api';
import type { DocumentFilterValues } from '@/features/projects/components/DocumentFilters';
import { usePresentationListStore } from '../stores/usePresentationListStore';

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
  documentFilters: DocumentFilterValues;
  setDocumentFilters: (filters: DocumentFilterValues) => void;
}

export const usePresentations = (): UsePresentationsReturn => {
  const presentationApiService = usePresentationApiService();

  const {
    search,
    sorting,
    pagination,
    documentFilters,
    setSearch,
    setSorting,
    setPagination,
    setDocumentFilters,
  } = usePresentationListStore();

  const { data, ...query } = useQuery<ApiResponse<Presentation[]>>({
    queryKey: [
      presentationApiService.getType(),
      'presentations',
      sorting,
      pagination,
      search,
      documentFilters,
    ],
    queryFn: async (): Promise<ApiResponse<Presentation[]>> => {
      const data = await presentationApiService.getPresentations({
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

export const useInfinitePresentations = (enabled = true) => {
  const presentationApiService = usePresentationApiService();
  const { search, sorting, documentFilters } = usePresentationListStore();
  const PAGE_SIZE = 20;

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: [
      presentationApiService.getType(),
      'presentations',
      'infinite',
      sorting,
      search,
      documentFilters,
    ],
    queryFn: async ({ pageParam }) => {
      return presentationApiService.getPresentations({
        page: pageParam as number,
        pageSize: PAGE_SIZE,
        sort: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : undefined,
        filter: search.trim() || undefined,
        grade: documentFilters.grade,
        subject: documentFilters.subject,
        chapter: documentFilters.chapter,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) => {
      const { currentPage, totalPages } = lastPage.pagination ?? {};
      if (currentPage == null || totalPages == null) return undefined;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    staleTime: 30000,
    enabled,
  });

  const presentations = data?.pages.flatMap((p: any) => p.data as Presentation[]) ?? [];
  return { presentations, hasNextPage: hasNextPage ?? false, fetchNextPage, isFetchingNextPage, isLoading };
};

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

export const useDuplicatePresentation = () => {
  const presentationApiService = usePresentationApiService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // 1. Fetch the existing presentation
      const original = await presentationApiService.getPresentationById(id);

      if (!original) {
        throw new Error('Presentation not found');
      }

      // 2. Transform data for duplication
      const duplicateData = {
        title: `${original.title} (Copy)`,
        slides: original.slides || [],
        theme: original.theme,
        viewport: original.viewport,
        isParsed: original.isParsed,
        thumbnail: typeof original.thumbnail === 'string' ? original.thumbnail : undefined,
      };

      // 3. Create new presentation using existing POST endpoint
      const duplicated = await presentationApiService.createPresentation(duplicateData);

      return duplicated;
    },
    onSuccess: (data) => {
      // Invalidate queries to refresh list
      queryClient.invalidateQueries({
        queryKey: [presentationApiService.getType(), 'presentations'],
      });

      toast.success(t('presentation:actions.duplicateSuccess', { title: data.title }));
    },
    onError: (error) => {
      toast.error(t('presentation:actions.duplicateError'));
      console.error('Failed to duplicate presentation:', error);
    },
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
        grade: request.grade,
        subject: request.subject,
        chapter: request.chapter,
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

export const useUpdatePresentationChapter = () => {
  const presentationApiService = usePresentationApiService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & UpdateChapterPayload) => {
      await getExamplePromptsApiService().updateDocumentChapter('presentation', id, payload);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [presentationApiService.getType(), 'presentations'],
      });
    },
  });
};
