import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
  type UseMutationReturnType,
} from '@tanstack/vue-query';
import { getMediaApi, type UploadedMediaResponse } from './api';

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Hook to upload an image file
 *
 * @example
 * ```ts
 * const uploadMutation = useUploadImage();
 *
 * const handleFileChange = (event: Event) => {
 *   const file = (event.target as HTMLInputElement).files?.[0];
 *   if (file) {
 *     uploadMutation.mutate(file, {
 *       onSuccess: (data) => {
 *         console.log('Uploaded to:', data.cdnUrl);
 *       }
 *     });
 *   }
 * };
 * ```
 */
export function useUploadImage(
  options?: UseMutationOptions<UploadedMediaResponse, Error, File>
): UseMutationReturnType<UploadedMediaResponse, Error, File, unknown> {
  const queryClient = useQueryClient();
  const mediaApi = getMediaApi();

  return useMutation({
    mutationFn: (file: File) => mediaApi.uploadImage(file),
    onSuccess: () => {
      // Optionally invalidate media-related queries if you have any
      // queryClient.invalidateQueries({ queryKey: ['media'] });
    },
    ...options,
  });
}
