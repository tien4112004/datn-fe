import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseInfiniteQueryResult,
  type InfiniteData,
  type UseMutationOptions,
  type UseMutationResult,
} from '@tanstack/react-query';
import { useImageApiService } from '../api';
import type { ImageGenerationRequest, ImageData, ImageGenerationResponse } from '../types/service';
import { ART_STYLE_OPTIONS } from '../types/constants';
import { useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import type { ArtStyle } from '@aiprimary/core';

// Return types for the hooks
export interface UseImageByIdReturn extends Omit<UseQueryResult<ImageData | null>, 'data'> {
  image: ImageData | null;
}

/**
 * Hook to generate an image
 *
 * @example
 * ```ts
 * const generateImageMutation = useGenerateImage();
 *
 * generateImageMutation.mutate({
 *   prompt: 'A beautiful sunset',
 *   model: 'dall-e-3',
 *   provider: 'openai',
 *   artStyle: 'photorealistic'
 * });
 * ```
 */
export const useGenerateImage = (
  options?: UseMutationOptions<ImageGenerationResponse, Error, ImageGenerationRequest>
): UseMutationResult<ImageGenerationResponse, Error, ImageGenerationRequest, unknown> => {
  const queryClient = useQueryClient();
  const imageApiService = useImageApiService();

  return useMutation({
    mutationFn: async (request: ImageGenerationRequest) => {
      const generatedImage = await imageApiService.generateImage(request);
      return generatedImage;
    },
    onSuccess: () => {
      // Invalidate images list after successful generation
      queryClient.invalidateQueries({ queryKey: [imageApiService.getType(), 'images'] });
    },
    ...options,
  });
};

export const useImageById = (id: string | undefined): UseImageByIdReturn => {
  const imageApiService = useImageApiService();

  const { data: image = null, ...query } = useQuery<ImageData | null>({
    queryKey: [imageApiService.getType(), 'image', id],
    queryFn: async (): Promise<ImageData | null> => {
      if (!id) {
        return null;
      }
      const imageData = await imageApiService.getImageById(id);
      return imageData;
    },
    enabled: !!id, // Only run the query if id is provided
    staleTime: 300000, // Consider data fresh for 5 minutes
    gcTime: 600000, // Keep in cache for 10 minutes
  });

  return {
    image,
    ...query,
  };
};

const PAGE_SIZE = 20;

export interface UseImagesReturn extends Omit<
  UseInfiniteQueryResult<InfiniteData<ImageData[], unknown>, Error>,
  'data'
> {
  images: ImageData[];
}

export const useImages = (search?: string): UseImagesReturn => {
  const imageApiService = useImageApiService();

  const { data, ...query } = useInfiniteQuery({
    queryKey: [imageApiService.getType(), 'images', search],
    queryFn: async ({ pageParam = 1 }): Promise<ImageData[]> => {
      const images = await imageApiService.getImages({
        page: pageParam,
        pageSize: PAGE_SIZE,
        search,
        sort: 'desc',
      });
      return images;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length + 1;
    },
    staleTime: 30000,
    gcTime: 300000,
  });

  const images = data?.pages.flatMap((page) => page) || [];

  return {
    images,
    ...query,
  };
};

// Art Styles Hook
export interface UseArtStylesReturn {
  artStyles: ArtStyle[];
  defaultStyle: ArtStyle | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Fallback art styles from constants
 */
const getFallbackArtStyles = (): ArtStyle[] => {
  return ART_STYLE_OPTIONS;
};

/**
 * Hook to fetch art styles from the API with caching and fallback support
 */
export const useArtStyles = (): UseArtStylesReturn => {
  const imageApiService = useImageApiService();
  const { t } = useTranslation('image');

  const {
    data: apiArtStyles,
    isLoading,
    isError,
    error,
  } = useQuery<ArtStyle[]>({
    queryKey: [imageApiService.getType(), 'artStyles'],
    queryFn: async () => {
      const styles = await imageApiService.getArtStyles({ pageSize: 50 });
      return styles;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 2, // Retry failed requests twice
  });

  // Show toast on error (non-blocking)
  useEffect(() => {
    if (isError && error) {
      toast.error(t('errors.artStylesLoadFailed'), {
        description: t('errors.usingFallbackStyles'),
      });
    }
  }, [isError, error, t]);

  // Use API data or fallback
  const artStyles = useMemo(() => {
    if (apiArtStyles && apiArtStyles.length > 0) {
      return apiArtStyles;
    }
    return getFallbackArtStyles();
  }, [apiArtStyles]);

  const defaultStyle = useMemo(
    () => artStyles.find((style) => style.name === '') || artStyles[0],
    [artStyles]
  );

  return {
    artStyles,
    defaultStyle,
    isLoading,
    isError,
    error: error as Error | null,
  };
};
