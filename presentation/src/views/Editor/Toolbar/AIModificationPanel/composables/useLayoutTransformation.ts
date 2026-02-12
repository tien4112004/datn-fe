import { ref, computed, type Ref, type ComputedRef } from 'vue';
import { storeToRefs } from 'pinia';
import { useSlidesStore } from '@/store';
import { useModelStore } from '@/stores/modelStore';
import { aiModificationService } from '@/services/ai/modifications';
import { convertToSlide, selectRandomTemplate, selectTemplateById } from '@/utils/slideLayout';
import type { SlideLayoutSchema } from '@/utils/slideLayout/types/schemas';
import { Columns, Grid, List as IconList } from 'lucide-vue-next';

export function useLayoutTransformation() {
  const slidesStore = useSlidesStore();
  const { currentSlide } = storeToRefs(slidesStore);
  const modelStore = useModelStore();

  // State
  const isTransforming = ref(false);

  // Computed
  const currentLayout = computed(() => currentSlide.value?.layout?.layoutType || 'LIST');

  const layoutTypes = [
    { label: 'List', value: 'LIST', icon: IconList },
    { label: 'Columns', value: 'TWO_COLUMN', icon: Columns },
    { label: 'Timeline', value: 'TIMELINE', icon: Grid },
    { label: 'Pyramid', value: 'PYRAMID', icon: Grid },
  ];

  const getViewport = () => ({
    width: slidesStore.viewportSize,
    height: slidesStore.viewportSize * slidesStore.viewportRatio,
  });

  /**
   * Get tooltip message for layout type
   */
  function getLayoutTooltip(layoutType: string): string {
    const tooltips: Record<string, string> = {
      LIST: 'Transform to a list. Your content may be expanded to fit!',
      TWO_COLUMN: 'Split into two columns. Content may be reorganized!',
      TIMELINE: 'Show as a timeline. Steps or dates may be added!',
      PYRAMID: 'Arrange as a pyramid. Content may be reordered!',
    };
    return tooltips[layoutType] || 'Change slide layout';
  }

  /**
   * Convert schema to slide
   */
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
   * Transform slide layout to a different type
   */
  async function transformLayout(targetType: string) {
    if (targetType === currentLayout.value) return;
    isTransforming.value = true;

    try {
      const result = await aiModificationService.processModification(
        {
          action: 'transform-layout',
          context: {
            type: 'slide',
            slideId: currentSlide.value?.id,
            slideSchema: currentSlide.value?.layout?.schema,
            slideType: currentSlide.value?.layout?.layoutType,
            currentImageSrc: getCurrentImageSrc(),
          },
          parameters: { targetType },
          model: modelStore.selectedModel.name,
          provider: modelStore.selectedModel.provider,
        },
        modelStore.selectedModel.name,
        modelStore.selectedModel.provider
      );

      if (result.success && result.data?.schema) {
        const newSlide = await schemaToSlide(result.data.schema as SlideLayoutSchema);
        slidesStore.updateSlide(newSlide, currentSlide.value!.id);
      }
    } catch (e) {
      console.error('Layout transformation failed:', e);
    } finally {
      isTransforming.value = false;
    }
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
    isTransforming,

    // Computed
    currentLayout,
    layoutTypes: computed(() => layoutTypes),

    // Methods
    transformLayout,
    getLayoutTooltip,
  };
}
