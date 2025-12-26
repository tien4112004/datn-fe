import { ref } from 'vue';
import type { Pinia } from 'pinia';
import { useSaveStore, useContainerStore, useSlidesStore } from '@/store';
import { generateThumbnail } from '@/utils/thumbnail';
import { getPresentationApi } from '@/services/presentation/api';
import { uploadThumbnail } from '@/services/presentation/thumbnail';
import type { Slide, SlideTheme, SlideViewport } from '@/types/slides';

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
        const thumbnailBase64 = await generateThumbnail(pinia);

        // Upload thumbnail to R2 and get URL (with fallback to base64)
        let thumbnailUrl = thumbnailBase64; // Default fallback
        if (thumbnailBase64) {
          try {
            thumbnailUrl = await uploadThumbnail('presentation', presentationId, thumbnailBase64);
            console.log('Thumbnail uploaded successfully, URL:', thumbnailUrl);
          } catch (error) {
            console.error('Failed to upload thumbnail, falling back to base64:', error);
            // Keep using thumbnailBase64 as fallback
          }
        }
        thumbnailToUse = thumbnailUrl;
      } else if (thumbnailToUse && thumbnailToUse.startsWith('data:image')) {
        // If provided thumbnail is base64, upload it
        try {
          thumbnailToUse = await uploadThumbnail('presentation', presentationId, thumbnailToUse);
          console.log('Provided thumbnail uploaded successfully, URL:', thumbnailToUse);
        } catch (error) {
          console.error('Failed to upload provided thumbnail, using as-is:', error);
          // Keep the base64 as fallback
        }
      }

      // Get data from store or use overrides
      const viewport: SlideViewport = overrides?.viewport ?? {
        width: slidesStore.viewportSize,
        height: slidesStore.viewportSize * slidesStore.viewportRatio,
      };

      // Prepare presentation data with slides and thumbnail URL
      const presentationData = {
        title: overrides?.title ?? slidesStore.title,
        slides: overrides?.slides ?? slidesStore.slides,
        theme: overrides?.theme ?? slidesStore.theme,
        viewport,
        thumbnail: thumbnailToUse, // Now a URL instead of base64 (unless upload failed)
      };

      // Call API to update presentation with all data
      await presentationApi.updatePresentation(presentationId, presentationData);

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
