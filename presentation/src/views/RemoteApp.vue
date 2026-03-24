<template>
  <Screen v-if="screening" :isPresentingInitial="presenter" />
  <Editor v-else-if="_isPC" />
  <Mobile v-else />

  <FullscreenSpin :loading="isLoading" :tip="$t('loading.generatingPresentation')" />
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount, ref, watch, computed, provide, getCurrentInstance } from 'vue';
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
import FullscreenSpin from '@/components/FullscreenSpin.vue';
import type { Presentation } from '../types/slides';
import type { PresentationGenerationRequest } from '../types/generation';
import { usePresentationProcessor } from '@/hooks/usePresentationProcessor';
import { useGenerationStore } from '@/store/generation';
import { useSavePresentation } from '@/hooks/useSavePresentation';
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
const isProcessing = ref(false);

// Save function reference for event bridge (React → Vue)
let savePresentationFn: (() => Promise<void>) | null = null;

// Pure computed loading state - no side effects
// Also include props.isGenerating to cover the pre-onMounted window where the
// processor hasn't started yet but the parent already knows generation is in progress.
const isLoading = computed(() => isProcessing.value || generationStore.isStreaming || !!props.isGenerating);

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

  if (props.presentation.headerFooterSettings) {
    slidesStore.setHeaderFooterSettings(props.presentation.headerFooterSettings);
  }

  // Get pinia instance
  const instance = getCurrentInstance();
  const pinia = instance?.appContext.config.globalProperties.$pinia;

  // Create save hook and provide to child components
  if (pinia) {
    const { savePresentation: saveFn } = useSavePresentation(props.presentation.id, pinia);
    provide('savePresentationFn', saveFn);
    savePresentationFn = saveFn;
  }

  // Event bridge: React can request a save via CustomEvent
  window.addEventListener('app.presentation.request-save', handleSaveRequest);

  const processorResult = usePresentationProcessor(
    props.presentation,
    props.presentation.id,
    generationStore.isStreaming,
    pinia!,
    props.generationRequest
  );
  // Sync the processor's isProcessing into our top-level ref via .value
  // (variable reassignment would break the computed's reactive dependency)
  watch(
    processorResult.isProcessing,
    (val) => {
      isProcessing.value = val;
    },
    { immediate: true }
  );

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
});

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

// Handle save requests from React container (for auto-save on navigation)
async function handleSaveRequest() {
  if (!savePresentationFn) {
    window.dispatchEvent(
      new CustomEvent('app.presentation.save-failed', {
        detail: { error: 'Save function not available' },
      })
    );
    return;
  }

  if (containerStore.mode === 'view') {
    window.dispatchEvent(
      new CustomEvent('app.presentation.save-failed', {
        detail: { error: 'Cannot save in view mode' },
      })
    );
    return;
  }

  try {
    await savePresentationFn();
    window.dispatchEvent(
      new CustomEvent('app.presentation.save-completed', {
        detail: { success: true },
      })
    );
  } catch (error) {
    window.dispatchEvent(
      new CustomEvent('app.presentation.save-failed', {
        detail: { error: error instanceof Error ? error.message : 'Save failed' },
      })
    );
  }
}

onBeforeUnmount(() => {
  window.removeEventListener('app.presentation.request-save', handleSaveRequest);
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
