import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  type UseQueryResult,
  type UseInfiniteQueryResult,
  type InfiniteData,
} from '@tanstack/react-query';
import { useImageApiService } from '../api';
import type { ImageGenerationRequest, ImageData } from '../types/service';

// Return types for the hooks
export interface UseImageByIdReturn extends Omit<UseQueryResult<ImageData | null>, 'data'> {
  image: ImageData | null;
}

export const useGenerateImage = () => {
  const imageApiService = useImageApiService();

  return useMutation({
    mutationFn: async (request: ImageGenerationRequest) => {
      const generatedImage = await imageApiService.generateImage(request);
      return generatedImage;
    },
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

export interface UseImagesReturn
  extends Omit<UseInfiniteQueryResult<InfiniteData<ImageData[], unknown>, Error>, 'data'> {
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
