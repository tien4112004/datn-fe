<template>
  <!-- Error State UI -->
  <div
    v-if="errorState.hasError && !isLoading"
    class="fixed inset-0 z-50 flex items-center justify-center bg-white p-4"
  >
    <div class="text-center">
      <div class="error-icon" style="font-size: 64px; color: #ff4d4f; margin-bottom: 16px">⚠️</div>
      <p class="mb-2 font-bold text-red-500">{{ $t('error.processingFailed') }}</p>
      <p class="mb-4 text-sm text-gray-600">{{ errorState.message }}</p>
      <button
        v-if="errorState.canRetry"
        @click="retryProcessing"
        class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        {{ $t('error.retry') }}
      </button>
    </div>
  </div>

  <!-- Existing content -->
  <template v-else>
    <Screen v-if="screening" :isPresentingInitial="presenter" />
    <Editor v-else-if="_isPC" />
    <Mobile v-else />
  </template>

  <!-- Loading spinner with error condition -->
  <FullscreenSpin
    v-if="!errorState.hasError"
    :loading="isLoading"
    :tip="$t('loading.generatingPresentation')"
  />
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, watch, computed, provide, getCurrentInstance } from 'vue';
import { storeToRefs } from 'pinia';
import { nanoid } from 'nanoid';
import {
  useScreenStore,
  useMainStore,
  useSnapshotStore,
  useSlidesStore,
  useContainerStore,
  useSaveStore,
} from '@/store';
import { LOCALSTORAGE_KEY_DISCARDED_DB } from '@/configs/storage';
import { deleteDiscardedDB } from '@/utils/database';
import { isPC } from '@/utils/common';
import type { Slide } from '@/types/slides';

import Editor from '../views/Editor/index.vue';
import Mobile from '../views/Mobile/index.vue';
import Screen from '../views/Screen/index.vue';
import FullscreenSpin from '@/components/FullscreenSpin.vue';
import type { Presentation } from '../types/slides';
import type { PresentationGenerationRequest } from '../types/generation';
import { usePresentationProcessor } from '@/hooks/usePresentationProcessor';
import { useGenerationStore } from '@/store/generation';
import { useSavePresentation } from '@/hooks/useSavePresentation';
import { getPresentationApi } from '@/services/presentation/api';
import useGlobalHotkey from '@/hooks/useGlobalHotkey';

const _isPC = isPC();

const props = defineProps<{
  isRemote: boolean;
  presentation: Presentation;
  mode: 'view' | 'edit';
  permission?: 'read' | 'comment' | 'edit';
  isStudent?: boolean;
  generationRequest?: PresentationGenerationRequest;
  isGenerating?: boolean;
}>();

const mainStore = useMainStore();
const slidesStore = useSlidesStore();
const snapshotStore = useSnapshotStore();
const containerStore = useContainerStore();
const saveStore = useSaveStore();
const generationStore = useGenerationStore();
const { databaseId } = storeToRefs(mainStore);
const { slides } = storeToRefs(slidesStore);
const { screening, presenter } = storeToRefs(useScreenStore());

// Track if this is the initial load to avoid marking as dirty
let isInitialLoad = ref(true);
let isProcessing = ref(false);

// Error state tracking
let loadingTimeoutId: number | null = null;
let processorResult: any = null;
const errorState = ref({
  hasError: false,
  message: '',
  canRetry: false,
  originalError: null as any,
});

// Computed loading state that combines processing and streaming states
const isLoading = computed(() => {
  const loading = isProcessing.value || generationStore.isStreaming;

  // Set timeout when loading starts
  if (loading && !loadingTimeoutId) {
    loadingTimeoutId = window.setTimeout(() => {
      if (isProcessing.value || generationStore.isStreaming) {
        console.error('[RemoteApp] Processing timeout after 60 seconds');
        errorState.value = {
          hasError: true,
          message: 'Processing took too long. Please try again.',
          canRetry: true,
          originalError: new Error('Timeout'),
        };
        // Force stop processing
        isProcessing.value = false;
        generationStore.stopStreaming();
      }
    }, 60000); // 60 seconds
  }

  // Clear timeout when loading stops
  if (!loading && loadingTimeoutId) {
    window.clearTimeout(loadingTimeoutId);
    loadingTimeoutId = null;
  }

  return loading;
});

// Get pinia instance and setup save presentation at top level
const instance = getCurrentInstance();
const pinia = instance?.appContext.config.globalProperties.$pinia;

let saveFn: (() => Promise<void>) | undefined;
if (pinia) {
  const result = useSavePresentation(props.presentation.id, pinia);
  saveFn = result.savePresentation;
}

// Setup global hotkey at top level (required for composable lifecycle)
useGlobalHotkey(saveFn);

onMounted(async () => {
  if (props.presentation.title) {
    slidesStore.setTitle(props.presentation.title);
  }

  if (props.presentation.theme) {
    slidesStore.setTheme(props.presentation.theme);
  }

  if (props.presentation.viewport) {
    slidesStore.setViewportSize(props.presentation.viewport.width);
  }

  processorResult = usePresentationProcessor(
    props.presentation,
    props.presentation.id,
    generationStore.isStreaming,
    pinia!,
    props.generationRequest
  );
  isProcessing = processorResult.isProcessing;

  isInitialLoad.value = true;
  containerStore.initialize(props);

  // Reset save state on mount to ensure clean state
  saveStore.reset();

  // RemoteApp always receives slides from the parent app via props
  // Deep clone to ensure reactivity (containerStore.presentation is markRaw'd)
  const presentationSlides = containerStore.presentation?.slides
    ? JSON.parse(JSON.stringify(containerStore.presentation.slides))
    : [];

  // Set slides from presentation (may be empty)
  slidesStore.setSlides(presentationSlides);

  await deleteDiscardedDB();
  snapshotStore.initSnapshotDatabase();

  isInitialLoad.value = false;

  // Listen for processing errors
  const handleProcessingError = (event: CustomEvent) => {
    const { error, statusCode, canRetry } = event.detail;
    errorState.value = {
      hasError: true,
      message: error || 'An unexpected error occurred',
      canRetry: canRetry || false,
      originalError: event.detail,
    };
  };

  window.addEventListener('app.presentation.processingError', handleProcessingError as EventListener);
});

// Cleanup on unmount
onUnmounted(() => {
  const handleProcessingError = (event: CustomEvent) => {
    const { error, statusCode, canRetry } = event.detail;
    errorState.value = {
      hasError: true,
      message: error || 'An unexpected error occurred',
      canRetry: canRetry || false,
      originalError: event.detail,
    };
  };
  window.removeEventListener('app.presentation.processingError', handleProcessingError as EventListener);
  if (loadingTimeoutId) {
    window.clearTimeout(loadingTimeoutId);
  }
});

// Retry function
const retryProcessing = async () => {
  // Reset error state
  errorState.value = {
    hasError: false,
    message: '',
    canRetry: false,
    originalError: null,
  };

  // Retry processing
  if (processorResult?.processFullAiResult) {
    await processorResult.processFullAiResult();
  }
};

watch(
  slides,
  () => {
    if (containerStore.mode === 'edit') {
      saveStore.markDirty();
    }
  },
  { deep: true }
);

watch(isInitialLoad, () => {
  saveStore.reset();
});

// When the application is unloaded, record the current indexedDB database ID in localStorage for later database cleanup
window.addEventListener('beforeunload', () => {
  const discardedDB = localStorage.getItem(LOCALSTORAGE_KEY_DISCARDED_DB);
  const discardedDBList: string[] = discardedDB ? JSON.parse(discardedDB) : [];

  discardedDBList.push(databaseId.value);

  const newDiscardedDB = JSON.stringify(discardedDBList);
  localStorage.setItem(LOCALSTORAGE_KEY_DISCARDED_DB, newDiscardedDB);
});
</script>

<style lang="scss">
#app {
  width: 100%;
  height: 100%;
  max-height: 100%;
  overflow-y: auto;
  margin: 0;
  padding: 0;
}
</style>
