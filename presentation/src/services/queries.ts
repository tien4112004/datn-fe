/**
 * Centralized export file for all TanStack Query hooks
 * Import queries and mutations from this file for convenience
 */

// Template queries
export { useSlideTemplates, useSlideTemplatesByLayout } from './template/queries';

// Presentation queries and mutations
export {
  // Queries
  usePresentation,
  useAiResult,
  useSlideThemes,
  useSharedUsers,
  usePublicAccessStatus,
  useShareState,
  useSearchUsers,
  // Mutations
  useUpsertSlide,
  useUpsertSlides,
  useSetParsed,
  useUpdatePresentation,
  useSharePresentation,
  useRevokeAccess,
  useSetPublicAccess,
  useStreamPresentation,
} from './presentation/queries';

// Image queries and mutations
export {
  // Queries
  useMyImages,
  useImageSearch,
  // Mutations
  useGenerateImage,
  useImageSearchMutation,
} from './image/queries';

// Media mutations
export { useUploadImage } from './media/queries';

// Query keys
export { queryKeys } from './query-keys';

// Query client
export { queryClient, VueQueryPlugin, vueQueryPluginOptions } from '@/lib/query-client';
