import { ref } from 'vue';
import type { Pinia } from 'pinia';
import { useSaveStore, useContainerStore, useSlidesStore } from '@/store';
import { generateThumbnail } from '@/utils/thumbnail';
import { getPresentationApi } from '@/services/presentation/api';
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
   */
  async function savePresentation(): Promise<void> {
    try {
      // Set saving state and notify React
      isSaving.value = true;
      dispatchSavingEvent(true);

      // Generate thumbnail from first slide
      const thumbnail = await generateThumbnail(pinia);

      // Get data from store
      const viewport: SlideViewport = {
        width: slidesStore.viewportSize,
        height: slidesStore.viewportSize * slidesStore.viewportRatio,
      };

      // Prepare presentation data with slides and thumbnail
      const presentationData = {
        title: slidesStore.title,
        slides: slidesStore.slides,
        theme: slidesStore.theme,
        viewport,
        thumbnail,
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
