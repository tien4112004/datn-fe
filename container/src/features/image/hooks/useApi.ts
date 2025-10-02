import { useQuery, useMutation, type UseQueryResult } from '@tanstack/react-query';
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
