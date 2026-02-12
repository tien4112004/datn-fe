import { ref, computed, type Ref, type ComputedRef } from 'vue';
import { storeToRefs } from 'pinia';
import { useMainStore, useSlidesStore } from '@/store';
import type { AIModificationState, CurrentContext } from '@/types/aiModification';

export function useAIModificationState(): {
  isProcessing: Ref<boolean>;
  error: Ref<string | null>;
  currentContext: ComputedRef<CurrentContext>;
  setProcessing: (processing: boolean) => void;
  setError: (errorMessage: string) => void;
} {
  const mainStore = useMainStore();
  const slidesStore = useSlidesStore();
  const { activeElementIdList, handleElement } = storeToRefs(mainStore);
  const { currentSlide } = storeToRefs(slidesStore);

  // Panel state
  const isProcessing = ref(false);
  const error = ref<string | null>(null);

  // Detect current context based on selection
  const currentContext = computed((): CurrentContext => {
    // Check if elements are selected
    if (activeElementIdList.value && activeElementIdList.value.length > 0) {
      if (activeElementIdList.value.length === 1) {
        const element = handleElement.value;
        const slideData = currentSlide.value;

        // Check if this is a combined text element in template preview mode
        if (
          (element as any)?._combined?.isCombined &&
          slideData?.layout?.isTemplatePreview &&
          slideData?.layout?.schema
        ) {
          const itemsArray = slideData.layout.schema.data?.items;
          if (itemsArray && Array.isArray(itemsArray)) {
            return {
              type: 'combined-text',
              data: {
                items: itemsArray,
                schema: slideData.layout.schema,
                layoutType: slideData.layout.layoutType,
                slideType: slideData.layout.layoutType,
                label: (element as any)._combined.label,
              },
            };
          }
        }

        // Regular single element
        if (element) {
          const elementType = element.type || 'text';
          return {
            type: 'element',
            elementType: elementType as any,
            data: element,
          };
        }
      } else {
        // Multiple elements selected
        return {
          type: 'elements',
          count: activeElementIdList.value.length,
          data: activeElementIdList.value,
        };
      }
    }

    // No elements selected - slide context
    return {
      type: 'slide',
      data: currentSlide.value,
    };
  });

  // Set processing state
  function setProcessing(processing: boolean) {
    isProcessing.value = processing;
    if (processing) {
      error.value = null;
    }
  }

  // Set error
  function setError(errorMessage: string) {
    error.value = errorMessage;
    isProcessing.value = false;
  }

  return {
    // State
    isProcessing,
    error,
    currentContext,

    // Methods
    setProcessing,
    setError,
  };
}
