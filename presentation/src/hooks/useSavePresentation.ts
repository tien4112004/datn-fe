import { ref } from 'vue';
import type { Pinia } from 'pinia';
import { useSaveStore, useContainerStore, useSlidesStore } from '@/store';
import { generateThumbnail } from '@/utils/thumbnail';
import { getPresentationApi } from '@/services/presentation/api';
import type { Slide, SlideTheme, SlideViewport } from '@/types/slides';

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

/**
 * Vue composable for saving presentations
 * Handles thumbnail generation, API calls, and state management
 */
export function useSavePresentation(presentationId: string, pinia: Pinia) {
  const isSaving = ref(false);
  const saveStore = useSaveStore();
  const containerStore = useContainerStore();
  const slidesStore = useSlidesStore();
  const presentationApi = getPresentationApi();

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
    try {
      // Set saving state and notify React
      isSaving.value = true;
      dispatchSavingEvent(true);

      // Use provided thumbnail or generate a new one
      let thumbnailToUse = overrides?.thumbnail;

      if (!thumbnailToUse) {
        // Generate thumbnail from first slide (base64)
        thumbnailToUse = await generateThumbnail(pinia);
      }

      // Get data from store or use overrides
      const viewport: SlideViewport = overrides?.viewport ?? {
        width: slidesStore.viewportSize,
        height: slidesStore.viewportSize * slidesStore.viewportRatio,
      };

      // Convert base64 thumbnail to Blob
      const thumbnailBlob = thumbnailToUse ? dataURLtoBlob(thumbnailToUse) : null;

      // Build data object with all non-file fields
      const data = {
        title: overrides?.title ?? slidesStore.title,
        slides: overrides?.slides ?? slidesStore.slides,
        isParsed: false,
        metadata: {},
      };

      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));

      if (thumbnailBlob) {
        formData.append('file', thumbnailBlob, 'thumbnail.png');
      }

      // Call API to update presentation with FormData
      await presentationApi.updatePresentation(presentationId, formData);

      // Mark as saved in store
      saveStore.markSaved();

      // Dispatch success message
      dispatchMessage('success', 'Presentation saved successfully');
    } catch (error) {
      console.error('Failed to save presentation:', error);
      dispatchMessage('error', 'Failed to save presentation');
      throw error;
    } finally {
      // Clear saving state and notify React
      isSaving.value = false;
      dispatchSavingEvent(false);
    }
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
