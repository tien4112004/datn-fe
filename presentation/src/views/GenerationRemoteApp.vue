<template>
  <template v-if="slides.length || generationStore.isStreaming">
    <Screen v-if="screening" :isPresentingInitial="presenter" />
    <Editor v-else-if="_isPC" />
    <Mobile v-else />
    <Spinner />
  </template>
  <div v-else-if="error" class="error-container">
    <div class="error-message">
      <h2>Error Loading Presentation</h2>
      <p>{{ error }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';
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

import Editor from '../views/Editor/index.vue';
import Mobile from '../views/Mobile/index.vue';
import Screen from '../views/Screen/index.vue';
import Spinner from '@/components/Spinner.vue';
import type { Presentation } from '../types/slides';
import type { PresentationGenerationRequest } from '../types/generation';
import { usePresentationProcessor } from '@/hooks/usePresentationProcessor';
import { useGenerationStore } from '@/store/generation';

const _isPC = isPC();

const mainStore = useMainStore();
const slidesStore = useSlidesStore();
const snapshotStore = useSnapshotStore();
const containerStore = useContainerStore();
const saveStore = useSaveStore();
const generationStore = useGenerationStore();
const { databaseId } = storeToRefs(mainStore);
const { slides } = storeToRefs(slidesStore);
const { screening, presenter } = storeToRefs(useScreenStore());

const isInitialized = ref(false);
const error = ref<string | null>(null);

let processorInstance: ReturnType<typeof usePresentationProcessor> | null = null;

// Handle presentation data from Flutter
const handlePresentationData = async (event: MessageEvent) => {
  const { type, data } = event.data;

  if (type === 'setGenerationData') {
    try {
      error.value = null;

      const { presentation, generationRequest } = data;

      if (!presentation || !presentation.id) {
        throw new Error('Invalid presentation data: missing presentation ID');
      }

      if (!generationRequest) {
        throw new Error('Invalid generation request data');
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
        presentation: presentation as Presentation,
        mode: 'view', // Generation is view-only
      });

      // Initialize with empty slides (will be populated by streaming)
      slidesStore.setSlides(presentation.slides || []);

      // Initialize snapshot database
      await deleteDiscardedDB();
      await snapshotStore.initSnapshotDatabase();

      // Initialize presentation processor for streaming
      processorInstance = usePresentationProcessor(
        (containerStore.presentation as any) || null,
        presentation.id,
        generationStore.isStreaming,
        generationRequest as PresentationGenerationRequest
      );

      // Reset save state
      saveStore.reset();

      // Mark as initialized
      isInitialized.value = true;

      // Notify Flutter that presentation is ready for generation
      if ((window as any).flutter_inappwebview) {
        (window as any).flutter_inappwebview.callHandler('generationStarted', {
          success: true,
          presentationId: presentation.id,
        });
      }
    } catch (err) {
      console.error('Error initializing generation:', err);
      error.value = err instanceof Error ? err.message : 'Failed to initialize generation';

      // Notify Flutter of error
      if ((window as any).flutter_inappwebview) {
        (window as any).flutter_inappwebview.callHandler('generationStarted', {
          success: false,
          error: error.value,
        });
      }
    }
  }
};

// Handle generation completion/error from store
const unwatchStreaming = ref<(() => void) | null>(null);
const unwatchError = ref<(() => void) | null>(null);

onMounted(() => {
  // Listen for messages from Flutter
  window.addEventListener('message', handlePresentationData);

  // Watch generation state
  unwatchStreaming.value = generationStore.$subscribe((mutation, state) => {
    if (!state.isStreaming && isInitialized.value) {
      // Notify Flutter of completion
      if ((window as any).flutter_inappwebview) {
        (window as any).flutter_inappwebview.callHandler('generationCompleted', {
          success: !state.error,
          error: state.error,
          slideCount: slides.value.length,
        });
      }
    }
  });

  // Watch for errors
  unwatchError.value = generationStore.$subscribe((mutation, state) => {
    if (state.error && isInitialized.value) {
      error.value = state.error;

      // Notify Flutter of error
      if ((window as any).flutter_inappwebview) {
        (window as any).flutter_inappwebview.callHandler('generationCompleted', {
          success: false,
          error: state.error,
        });
      }
    }
  });

  // Notify Flutter that the view is ready
  if ((window as any).flutter_inappwebview) {
    (window as any).flutter_inappwebview.callHandler('generationViewReady');
  }

  // Also support direct function calls from Flutter
  (window as any).setGenerationData = (
    presentation: Presentation,
    generationRequest: PresentationGenerationRequest
  ) => {
    handlePresentationData({
      data: {
        type: 'setGenerationData',
        data: { presentation, generationRequest },
      },
    } as MessageEvent);
  };

  // Set a timeout to show error if no data received within 15 seconds
  const timeout = setTimeout(() => {
    if (!isInitialized.value && !error.value) {
      error.value = 'Timeout: No presentation data received from Flutter';
    }
  }, 15000);

  // Clear timeout on unmount
  onUnmounted(() => {
    clearTimeout(timeout);
  });
});

onUnmounted(() => {
  // Clean up event listeners
  window.removeEventListener('message', handlePresentationData);
  delete (window as any).setGenerationData;

  // Stop streaming if still active
  if (generationStore.isStreaming) {
    generationStore.stopStreaming();
  }

  // Clean up watchers
  if (unwatchStreaming.value) {
    unwatchStreaming.value();
  }
  if (unwatchError.value) {
    unwatchError.value();
  }

  // Clean up database
  const discardedDB = localStorage.getItem(LOCALSTORAGE_KEY_DISCARDED_DB);
  const discardedDBList: string[] = discardedDB ? JSON.parse(discardedDB) : [];
  discardedDBList.push(databaseId.value);
  const newDiscardedDB = JSON.stringify(discardedDBList);
  localStorage.setItem(LOCALSTORAGE_KEY_DISCARDED_DB, newDiscardedDB);
});
</script>

<style lang="scss" scoped>
.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: #f5f5f5;
}

.error-message {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  max-width: 500px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  h2 {
    color: #e53e3e;
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }

  p {
    color: #4a5568;
    line-height: 1.6;
  }
}

#app {
  width: 100%;
  height: 100%;
  max-height: 100%;
  overflow-y: auto;
  margin: 0;
  padding: 0;
}
</style>
