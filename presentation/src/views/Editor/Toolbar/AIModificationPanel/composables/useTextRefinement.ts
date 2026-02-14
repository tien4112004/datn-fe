import { ref, type Ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useSlidesStore } from '@/store';
import { useModelStore } from '@/stores/modelStore';
import { aiModificationService } from '@/services/ai/modifications';
import { convertToSlide, selectRandomTemplate, selectTemplateById } from '@/utils/slideLayout';
import type { SlideLayoutSchema } from '@/utils/slideLayout/types/schemas';
import emitter, { EmitterEvents } from '@/utils/emitter';
import { htmlToText } from '@/utils/common';

export function useTextRefinement() {
  const slidesStore = useSlidesStore();
  const { currentSlide } = storeToRefs(slidesStore);
  const modelStore = useModelStore();

  // State
  const chatInput = ref('');
  const isProcessing = ref(false);
  const refineMessage = ref('');
  const refineType = ref<'info' | 'success' | 'error'>('info');
  const currentOperation = ref<string>('expand');

  const getViewport = () => ({
    width: slidesStore.viewportSize,
    height: slidesStore.viewportSize * slidesStore.viewportRatio,
  });

  async function schemaToSlide(schema: SlideLayoutSchema) {
    const slide = currentSlide.value;
    const viewport = getViewport();
    const theme = slidesStore.theme;

    // Select template based on the new schema type
    let template;
    if (slide?.layout?.templateId && slide?.layout?.layoutType && slide.layout.layoutType === schema.type) {
      // Reuse existing template only if layout type hasn't changed
      template = await selectTemplateById(slide.layout.layoutType, slide.layout.templateId);
    } else {
      // Pick a random template for the new layout type
      template = await selectRandomTemplate(schema.type);
    }

    return convertToSlide(schema, viewport, theme, template, slide?.id, slide.layout?.parameterOverrides);
  }

  /**
   * Refine text content of a specific text element
   */
  async function refineElementText(elementId: string, content: string, instruction: string) {
    if (!chatInput.value.trim() || isProcessing.value) return;

    isProcessing.value = true;
    refineMessage.value = '';

    try {
      const plainText = htmlToText(content);

      const result = await aiModificationService.refineElementText(
        {
          slideId: currentSlide.value!.id,
          elementId,
          currentText: plainText,
          instruction,
          slideSchema: currentSlide.value?.layout?.schema,
          slideType: currentSlide.value?.layout?.layoutType,
        },
        modelStore.selectedModel.name,
        modelStore.selectedModel.provider
      );

      if (result.success && result.data?.refinedText) {
        emitter.emit(EmitterEvents.RICH_TEXT_COMMAND, {
          action: { command: 'replace', value: result.data.refinedText },
        });

        refineMessage.value = 'Text refined successfully!';
        refineType.value = 'success';
        chatInput.value = '';
      } else {
        throw new Error(result.error || 'Failed to refine text');
      }
    } catch (error: any) {
      refineMessage.value = error.message || 'Failed to refine text';
      refineType.value = 'error';
    } finally {
      isProcessing.value = false;
    }
  }

  /**
   * Refine combined text items
   */
  async function refineCombinedText(items: any[], schema: any, instruction: string) {
    if (!chatInput.value.trim() || isProcessing.value) return;

    isProcessing.value = true;
    refineMessage.value = '';

    try {
      const result = await aiModificationService.refineCombinedText(
        {
          slideId: currentSlide.value!.id,
          items,
          instruction,
          operation: currentOperation.value,
          slideSchema: schema,
          slideType: schema.type,
        },
        modelStore.selectedModel.name,
        modelStore.selectedModel.provider
      );

      if (result.success && result.data?.expandedItems) {
        // Update the schema with refined items
        const updatedSchema = JSON.parse(JSON.stringify(schema));
        updatedSchema.data.items = result.data.expandedItems;

        // Recalculate the slide layout with updated schema
        const updatedSlide = await schemaToSlide(updatedSchema);
        slidesStore.updateSlide(updatedSlide, currentSlide.value!.id);

        refineMessage.value = 'Combined text refined successfully!';
        refineType.value = 'success';
        chatInput.value = '';
      } else {
        throw new Error(result.error || 'Failed to refine combined text');
      }
    } catch (error: any) {
      refineMessage.value = error.message || 'Failed to refine combined text';
      refineType.value = 'error';
    } finally {
      isProcessing.value = false;
    }
  }

  /**
   * Refine slide content
   */
  async function refineSlideContent(instruction: string) {
    if (!chatInput.value.trim() || isProcessing.value) return;

    isProcessing.value = true;
    refineMessage.value = '';

    try {
      const result = await aiModificationService.processModification(
        {
          action: 'refine-content',
          context: {
            type: 'slide',
            slideId: currentSlide.value?.id,
            slideSchema: currentSlide.value?.layout?.schema,
            slideType: currentSlide.value?.layout?.layoutType,
            currentImageSrc: getCurrentImageSrc(),
          },
          parameters: {
            instruction,
            operation: currentOperation.value,
          },
          model: modelStore.selectedModel.name,
          provider: modelStore.selectedModel.provider,
        },
        modelStore.selectedModel.name,
        modelStore.selectedModel.provider
      );

      if (result.success && result.data?.schema) {
        const newSlide = await schemaToSlide(result.data.schema as SlideLayoutSchema);
        slidesStore.updateSlide(newSlide, currentSlide.value!.id);

        refineMessage.value = 'Content refined successfully!';
        refineType.value = 'success';
        chatInput.value = '';
      } else {
        throw new Error(result.error || 'Failed to refine content');
      }
    } catch (e: any) {
      refineMessage.value = e.message;
      refineType.value = 'error';
    } finally {
      isProcessing.value = false;
    }
  }

  /**
   * Clear feedback message
   */
  function clearFeedback() {
    refineMessage.value = '';
    refineType.value = 'info';
  }

  /**
   * Get current image source from slide
   */
  function getCurrentImageSrc(): string | undefined {
    const el = currentSlide.value?.elements?.find((e) => e.type === 'image') as any;
    return el?.src;
  }

  return {
    // State
    chatInput,
    isProcessing,
    refineMessage,
    refineType,
    currentOperation,

    // Methods
    refineElementText,
    refineCombinedText,
    refineSlideContent,
    clearFeedback,
  };
}
