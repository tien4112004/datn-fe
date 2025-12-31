import { ref, computed, type Ref, type ComputedRef } from 'vue';
import { storeToRefs } from 'pinia';
import { useMainStore, useSlidesStore } from '@/store';
import type { AIAction, AIModificationState, CurrentContext, AIContextType } from '@/types/aiModification';
import { getActionsForContext } from './actions';

export function useAIModificationState(): {
  selectedAction: Ref<AIAction | null>;
  parameterValues: Ref<Record<string, string | number>>;
  isProcessing: Ref<boolean>;
  previewData: Ref<unknown>;
  error: Ref<string | null>;
  currentContext: ComputedRef<CurrentContext>;
  availableActions: ComputedRef<AIAction[]>;
  state: ComputedRef<AIModificationState>;
  selectAction: (action: AIAction) => void;
  updateParameter: (parameterId: string, value: string | number) => void;
  reset: () => void;
  setProcessing: (processing: boolean) => void;
  setError: (errorMessage: string) => void;
  setPreviewData: (data: unknown) => void;
} {
  const mainStore = useMainStore();
  const slidesStore = useSlidesStore();
  const { activeElementIdList, handleElement } = storeToRefs(mainStore);
  const { currentSlide } = storeToRefs(slidesStore);

  // Panel state
  const selectedAction = ref<AIAction | null>(null);
  const parameterValues = ref<Record<string, string | number>>({});
  const isProcessing = ref(false);
  const previewData = ref<unknown>(null);
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

  // Filter actions based on current context
  const availableActions = computed(() => {
    const contextType = currentContext.value.type as string;
    const elementType = currentContext.value.elementType as string | undefined;
    return getActionsForContext(contextType, elementType);
  });

  // Initialize parameter values when action is selected
  function selectAction(action: AIAction) {
    selectedAction.value = action;
    error.value = null;
    previewData.value = null;

    // Initialize parameter values with defaults
    const newParams: Record<string, string | number> = {};
    action.parameters.forEach((param) => {
      newParams[param.id] = param.defaultValue;
    });
    parameterValues.value = newParams;
  }

  // Update a parameter value
  function updateParameter(parameterId: string, value: string | number) {
    parameterValues.value[parameterId] = value;
  }

  // Reset state
  function reset() {
    selectedAction.value = null;
    parameterValues.value = {};
    isProcessing.value = false;
    previewData.value = null;
    error.value = null;
  }

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

  // Set preview data
  function setPreviewData(data: unknown) {
    previewData.value = data;
    isProcessing.value = false;
  }

  // Create the state object as computed
  const state = computed(
    (): AIModificationState => ({
      selectedAction: selectedAction.value,
      parameterValues: parameterValues.value,
      isProcessing: isProcessing.value,
      previewData: previewData.value,
      error: error.value,
    })
  );

  return {
    // State
    selectedAction,
    parameterValues,
    isProcessing,
    previewData,
    error,
    currentContext,
    availableActions,
    state,

    // Methods
    selectAction,
    updateParameter,
    reset,
    setProcessing,
    setError,
    setPreviewData,
  };
}
