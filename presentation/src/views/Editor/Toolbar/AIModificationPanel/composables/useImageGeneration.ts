import { ref, computed, type Ref, type ComputedRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useSlidesStore } from '@/store';
import { useModelStore } from '@/stores/modelStore';
import { aiModificationService } from '@/services/ai/modifications';
import { updateImageSource } from '@/utils/slideLayout';
import { extractThemeColors } from '@/utils/themeColorExtractor';
import type { PPTImageElement } from '@/types/slides';
import { getThemeApi } from '@/services/theme/api';

export function useImageGeneration() {
  const { t } = useI18n();
  const slidesStore = useSlidesStore();
  const { currentSlide } = storeToRefs(slidesStore);
  const modelStore = useModelStore();
  const { selectedImageModel } = storeToRefs(modelStore);

  // State
  const imagePrompt = ref('');
  const selectedStyle = ref('photorealistic');
  const matchSlideTheme = ref(true);
  const generatedImageUrl = ref<string | null>(null);
  const isProcessing = ref(false);
  const refineMessage = ref('');
  const refineType = ref<'info' | 'success' | 'error'>('info');

  const getViewport = () => ({
    width: slidesStore.viewportSize,
    height: slidesStore.viewportSize * slidesStore.viewportRatio,
  });

  // Computed
  const canGenerate = computed(() => imagePrompt.value.trim().length > 0 && !isProcessing.value);

  /**
   * Generate image based on prompt and style
   */
  async function generateImage(elementId: string, availableArtStyles: any[]): Promise<void> {
    if (!imagePrompt.value || isProcessing.value) return;

    isProcessing.value = true;
    refineMessage.value = '';

    try {
      let themeDescription: string | undefined = undefined;

      if (matchSlideTheme.value && slidesStore.theme) {
        // Check if modifiers are stale and need regeneration
        if (slidesStore.theme.modifiersStale) {
          try {
            const { primaryColor, backgroundColor, textColor } = extractThemeColors(slidesStore.theme);
            themeDescription = await getThemeApi().generateThemeDescription({
              primaryColor,
              backgroundColor,
              textColor,
            });

            // Update theme with fresh modifiers and clear stale flag
            slidesStore.setTheme({
              ...slidesStore.theme,
              modifiers: themeDescription,
              modifiersStale: false,
            });
          } catch (error) {
            console.error('[useImageGeneration] Failed to regenerate theme modifiers:', error);
            // Fall back to existing modifiers (may be stale)
            themeDescription = slidesStore.theme.modifiers || undefined;
          }
        } else {
          // Use existing modifiers (they're fresh)
          themeDescription = slidesStore.theme.modifiers || undefined;
        }
      }

      let artDescription: string | undefined = undefined;
      if (availableArtStyles.length > 0) {
        const selectedArtStyle = availableArtStyles.find(
          (style) =>
            style.id === selectedStyle.value ||
            style.name === selectedStyle.value ||
            style.value === selectedStyle.value
        );
        if (selectedArtStyle?.modifiers) {
          artDescription = selectedArtStyle.modifiers;
        }
      }

      const result = await aiModificationService.replaceElementImage(
        {
          slideId: currentSlide.value!.id,
          elementId,
          description: imagePrompt.value,
          style: selectedStyle.value,
          themeDescription: themeDescription,
          artDescription: artDescription,
          slideSchema: currentSlide.value?.layout?.schema,
          slideType: currentSlide.value?.layout?.layoutType,
        },
        selectedImageModel.value.name,
        selectedImageModel.value.provider
      );

      if (result.success && result.data?.imageUrl) {
        // Step 1: Store the generated image URL for preview
        generatedImageUrl.value = result.data.imageUrl;
      } else {
        throw new Error(result.error || t('panels.aiModification.messages.imageGenerationError'));
      }
    } catch (error: any) {
      console.error('Failed to generate image:', error);
      refineMessage.value = error.message || t('panels.aiModification.messages.imageGenerationError');
      refineType.value = 'error';
    } finally {
      isProcessing.value = false;
    }
  }

  /**
   * Confirm and apply the generated image
   */
  async function confirmReplacement(elementId: string): Promise<void> {
    if (!generatedImageUrl.value || isProcessing.value) return;

    isProcessing.value = true;

    try {
      // Step 2: Apply the generated image to the slide
      const newImageUrl = generatedImageUrl.value;

      // Find the element
      const element = currentSlide.value?.elements?.find((e) => e.id === elementId) as
        | PPTImageElement
        | undefined;
      if (!element) return;

      const updated = await updateImageSource(element, newImageUrl);

      // Update element visual properties
      slidesStore.updateElement({
        id: element.id,
        props: { src: updated.src, clip: updated.clip },
      });

      // Update schema with new image URL
      if (currentSlide.value?.layout?.schema) {
        const updatedSchema = JSON.parse(JSON.stringify(currentSlide.value.layout.schema));

        // Update image URL in schema based on layout type
        if (updatedSchema.data?.image !== undefined) {
          updatedSchema.data.image = newImageUrl;
        }

        // Update slide's layout with new schema
        const updatedLayout = {
          ...currentSlide.value.layout,
          schema: updatedSchema,
        };

        slidesStore.updateSlide(
          {
            ...currentSlide.value,
            layout: updatedLayout,
          },
          currentSlide.value.id
        );
      }

      // Clear state and show success message
      imagePrompt.value = '';
      generatedImageUrl.value = null;
      refineMessage.value = t('panels.aiModification.messages.imageReplacedSuccess');
      refineType.value = 'success';
    } catch (error: any) {
      console.error('Failed to replace image:', error);
      refineMessage.value = error.message || t('panels.aiModification.messages.imageReplaceError');
      refineType.value = 'error';
    } finally {
      isProcessing.value = false;
    }
  }

  /**
   * Cancel image generation and reset to step 1
   */
  function cancelGeneration() {
    generatedImageUrl.value = null;
  }

  /**
   * Clear feedback message
   */
  function clearFeedback() {
    refineMessage.value = '';
    refineType.value = 'info';
  }

  return {
    // State
    imagePrompt,
    selectedStyle,
    matchSlideTheme,
    generatedImageUrl,
    isProcessing,
    refineMessage,
    refineType,

    // Methods
    generateImage,
    confirmReplacement,
    cancelGeneration,
    clearFeedback,

    // Computed
    canGenerate,
  };
}
