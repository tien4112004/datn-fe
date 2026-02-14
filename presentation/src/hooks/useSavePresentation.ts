import { computed, watch } from 'vue';
import type { Pinia } from 'pinia';
import { useSaveStore, useContainerStore, useSlidesStore } from '@/store';
import { generateThumbnail } from '@/utils/thumbnail';
import { useUpdatePresentation } from '@/services/presentation/queries';
import type { Slide, SlideTheme, SlideViewport } from '@/types/slides';

/**
 * Convert data URL (base64) to Blob for multipart upload
 * Supports both PNG and JPEG formats
 */
function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Vue composable for saving presentations
 * Handles thumbnail generation, API calls, and state management
 */
export function useSavePresentation(presentationId: string, pinia: Pinia) {
  const saveStore = useSaveStore();
  const containerStore = useContainerStore();
  const slidesStore = useSlidesStore();
  const updatePresentationMutation = useUpdatePresentation();

  // Use mutation's isPending state directly
  const isSaving = computed(() => updatePresentationMutation.isPending.value);

  // Watch mutation state to dispatch events to React
  watch(isSaving, (saving) => {
    dispatchSavingEvent(saving);
  });

  /**
   * Save presentation with all data from store (title, slides, theme, viewport, thumbnail)
   * Dispatches events to React for UI feedback
   *
   * @param overrides - Optional overrides for presentation data (title, slides, theme, viewport, thumbnail)
   */
  async function savePresentation(overrides?: {
    title?: string;
    slides?: Slide[];
    theme?: SlideTheme;
    viewport?: SlideViewport;
    thumbnail?: string;
  }): Promise<void> {
    // Prevent duplicate saves while mutation is in progress
    if (updatePresentationMutation.isPending.value) return;

    // Use provided thumbnail or generate a new one
    let thumbnailToUse = overrides?.thumbnail;

    // Only generate thumbnail if not provided or if it's not a valid data URL
    if (!thumbnailToUse || !thumbnailToUse.startsWith('data:')) {
      // Generate thumbnail from first slide (base64)
      thumbnailToUse = await generateThumbnail(pinia);
    }

    // Get data from store or use overrides
    const viewport: SlideViewport = overrides?.viewport ?? {
      width: slidesStore.viewportSize,
      height: slidesStore.viewportSize * slidesStore.viewportRatio,
    };

    // Convert base64 thumbnail to Blob (only if it's a data URL)
    const thumbnailBlob =
      thumbnailToUse && thumbnailToUse.startsWith('data:') ? dataURLtoBlob(thumbnailToUse) : null;

    // Build data object with all non-file fields
    const data = {
      title: overrides?.title ?? slidesStore.title,
      slides: overrides?.slides ?? slidesStore.slides,
      theme: overrides?.theme ?? slidesStore.theme,
      isParsed: true,
      viewport,
      // Include thumbnail URL if we're not uploading a new file (i.e., it's already an R2 URL)
      // This prevents the backend from setting thumbnail to null when no file is uploaded
      ...(thumbnailBlob ? {} : { thumbnail: thumbnailToUse }),
    };

    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));

    if (thumbnailBlob) {
      formData.append('file', thumbnailBlob, 'thumbnail.png');
    }

    // Call API to update presentation with FormData
    updatePresentationMutation.mutate(
      { presentationId, data: formData },
      {
        onSuccess: () => {
          // Mark as saved in store
          saveStore.markSaved();
          // Dispatch success message
          dispatchMessage('success', 'Presentation saved successfully');
        },
        onError: (error) => {
          console.error('Failed to save presentation:', error);
          dispatchMessage('error', 'Failed to save presentation');
        },
      }
    );
  }

  /**
   * Dispatch saving state event to React for GlobalSpinner
   */
  function dispatchSavingEvent(saving: boolean) {
    if (!containerStore.isRemote) return;

    window.dispatchEvent(
      new CustomEvent('app.presentation.saving', {
        detail: { isSaving: saving },
      })
    );
  }

  /**
   * Dispatch message event to React for toast notifications
   */
  function dispatchMessage(type: string, message: string) {
    window.dispatchEvent(
      new CustomEvent('app.message', {
        detail: { type, message },
      })
    );
  }

  return {
    isSaving,
    savePresentation,
  };
}
