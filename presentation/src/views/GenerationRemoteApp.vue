<template>
  <div v-if="loading" class="fixed inset-0 z-50 flex items-center justify-center bg-white">
    <div class="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
  </div>

  <div v-else-if="error" class="fixed inset-0 z-50 flex items-center justify-center bg-white p-4">
    <div class="text-center text-red-500">
      <p class="font-bold">Error loading presentation</p>
      <p class="text-sm">{{ error }}</p>
    </div>
  </div>

  <template v-else>
    <Screen v-if="screening" :isPresentingInitial="presenter" />
    <Editor v-else-if="_isPC" />
    <Mobile v-else />
  </template>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, provide, getCurrentInstance } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
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
import { changeLocale } from '@/locales';
import { getPresentationWebViewApi } from '@/services/presentation/api';

import Editor from '../views/Editor/index.vue';
import Mobile from '../views/Mobile/index.vue';
import Screen from '../views/Screen/index.vue';
import type { Presentation } from '../types/slides';
import type { PresentationGenerationRequest } from '../types/generation';
import { usePresentationProcessor } from '@/hooks/usePresentationProcessor';
import { useGenerationStore } from '@/store/generation';
import { useSavePresentation } from '@/hooks/useSavePresentation';

const GENERATION_REQUEST_STORAGE_KEY = 'generation_request';

const _isPC = isPC();
const route = useRoute();

const mainStore = useMainStore();
const slidesStore = useSlidesStore();
const snapshotStore = useSnapshotStore();
const containerStore = useContainerStore();
const saveStore = useSaveStore();
const generationStore = useGenerationStore();
const { databaseId } = storeToRefs(mainStore);
const { slides } = storeToRefs(slidesStore);
const { screening, presenter } = storeToRefs(useScreenStore());

const loading = ref(true);
const error = ref<string | null>(null);
const isInitialized = ref(false);

const api = getPresentationWebViewApi();

let processorInstance: ReturnType<typeof usePresentationProcessor> | null = null;

// Centralized error handling
const handleError = (err: unknown) => {
  console.error('Error in generation:', err);
  error.value = err instanceof Error ? err.message : 'Failed to initialize generation';
  loading.value = false;

  // Notify Flutter of error
  if ((window as any).flutter_inappwebview) {
    (window as any).flutter_inappwebview.callHandler('generationCompleted', {
      success: false,
      error: error.value,
    });
  }
};

// Initialize generation with presentation data
const initGeneration = async (
  presentation: Presentation,
  generationRequest: PresentationGenerationRequest
) => {
  try {
    // Set title if provided
    if (presentation.title) {
      slidesStore.setTitle(presentation.title);
    }

    // Set theme if provided
    if (presentation.theme) {
      slidesStore.setTheme(presentation.theme);
    }

    // Set viewport if provided
    if (presentation.viewport) {
      slidesStore.setViewportSize(presentation.viewport.width);
    }

    // Initialize container store with presentation data
    containerStore.initialize({
      isRemote: true,
      presentation: presentation,
      mode: 'view', // Generation is view-only
    });

    // Initialize with empty slides (will be populated by streaming)
    slidesStore.setSlides(presentation.slides || []);

    // Initialize snapshot database
    await deleteDiscardedDB();
    await snapshotStore.initSnapshotDatabase();

    // Get pinia instance
    const instance = getCurrentInstance();
    const pinia = instance?.appContext.config.globalProperties.$pinia;

    // Create save hook and provide to child components
    if (pinia) {
      const { savePresentation: saveFn } = useSavePresentation(presentation.id, pinia);
      provide('savePresentationFn', saveFn);
    }

    // Initialize presentation processor for streaming
    processorInstance = usePresentationProcessor(
      (containerStore.presentation as any) || null,
      presentation.id,
      generationStore.isStreaming,
      pinia!,
      generationRequest
    );

    // Reset save state
    saveStore.reset();

    // Mark as initialized
    loading.value = false;
    isInitialized.value = true;

    // Notify Flutter that generation has started
    if ((window as any).flutter_inappwebview) {
      (window as any).flutter_inappwebview.callHandler('generationStarted', {
        success: true,
        presentationId: presentation.id,
      });
    }
  } catch (err) {
    handleError(err);
  }
};

// Watch generation state for completion/errors
const unwatchGeneration = ref<(() => void) | null>(null);

// Start generation process (called after Flutter stores data in localStorage)
const startGenerationProcess = async () => {
  // Get presentation ID from route
  const presentationId = route.params.id as string;
  if (!presentationId) {
    handleError(new Error('No presentation ID found in URL'));
    return;
  }

  try {
    loading.value = true;

    // Fetch presentation
    const presentation = await api.getPresentation(presentationId);

    // Get generation request from localStorage (stored by Flutter)
    const storedRequest = localStorage.getItem(`${GENERATION_REQUEST_STORAGE_KEY}_${presentationId}`);
    if (!storedRequest) {
      handleError(new Error('No generation request found. Please try again.'));
      return;
    }

    let generationRequest: PresentationGenerationRequest;
    try {
      generationRequest = JSON.parse(storedRequest);
    } catch (parseError) {
      handleError(new Error('Invalid generation request data'));
      return;
    }

    // Clean up stored request
    localStorage.removeItem(`${GENERATION_REQUEST_STORAGE_KEY}_${presentationId}`);

    // Initialize generation
    await initGeneration(presentation, generationRequest);
  } catch (err) {
    handleError(err);
  }
};

onMounted(async () => {
  // 1. Apply locale from localStorage (injected by Flutter WebView)
  const savedLocale = localStorage.getItem('i18nextLng');
  if (savedLocale) {
    changeLocale(savedLocale);
  }

  // 2. Extract token from URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  if (token) {
    console.log('[GenerationRemoteApp] Token found in URL, storing in localStorage');
    localStorage.setItem('access_token', token);
  } else {
    console.warn('[GenerationRemoteApp] No token provided in URL query parameter');
  }

  // 3. Watch generation state for completion/errors (consolidated watcher)
  unwatchGeneration.value = generationStore.$subscribe((mutation, state) => {
    if (!isInitialized.value) return;

    // Handle streaming completion
    if (!state.isStreaming) {
      if ((window as any).flutter_inappwebview) {
        (window as any).flutter_inappwebview.callHandler('generationCompleted', {
          success: !state.error,
          error: state.error,
          slideCount: slides.value.length,
        });
      }
    }

    // Handle errors
    if (state.error) {
      error.value = state.error;
    }
  });

  // 4. Expose function for Flutter to call after storing generation data
  (window as any).startGeneration = () => {
    console.log('[GenerationRemoteApp] startGeneration called by Flutter');
    startGenerationProcess();
  };

  // 5. Notify Flutter view is ready (Flutter will store data and call startGeneration)
  if ((window as any).flutter_inappwebview) {
    (window as any).flutter_inappwebview.callHandler('generationViewReady');
  }
});

onUnmounted(() => {
  // Stop streaming if still active
  if (generationStore.isStreaming) {
    generationStore.stopStreaming();
  }

  // Clean up watcher
  if (unwatchGeneration.value) {
    unwatchGeneration.value();
  }

  // Clean up exposed function
  delete (window as any).startGeneration;

  // Clean up database
  const discardedDB = localStorage.getItem(LOCALSTORAGE_KEY_DISCARDED_DB);
  const discardedDBList: string[] = discardedDB ? JSON.parse(discardedDB) : [];
  discardedDBList.push(databaseId.value);
  const newDiscardedDB = JSON.stringify(discardedDBList);
  localStorage.setItem(LOCALSTORAGE_KEY_DISCARDED_DB, newDiscardedDB);
});
</script>
