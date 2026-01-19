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
        // Single element selected
        const elementType = handleElement.value?.type || 'text';
        return {
          type: 'element',
          elementType: elementType as any,
          data: handleElement.value,
        };
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
