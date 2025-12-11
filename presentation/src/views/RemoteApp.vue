<template>
  <template v-if="slides.length">
    <Screen v-if="screening" :isPresentingInitial="presenter" />
    <Editor v-else-if="_isPC" />
    <Mobile v-else />
    <Spinner />
  </template>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
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
import api from '@/services';

import Editor from '../views/Editor/index.vue';
import Mobile from '../views/Mobile/index.vue';
import Screen from '../views/Screen/index.vue';
import Spinner from '@/components/Spinner.vue';
import type { Presentation } from '../types/slides';
import type { PresentationGenerationRequest } from '../types/generation';
import { usePresentationProcessor } from '@/hooks/usePresentationProcessor';
import { useGenerationStore } from '@/store/generation';

const _isPC = isPC();

const props = defineProps<{
  isRemote: boolean;
  presentation: Presentation;
  mode: 'view' | 'edit';
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

onMounted(async () => {
  if (props.presentation.theme) {
    slidesStore.setTheme(props.presentation.theme);
  }

  if (props.presentation.viewport) {
    slidesStore.setViewportSize(props.presentation.viewport.width);
  }

  const { isProcessing } = usePresentationProcessor(
    (containerStore.presentation || null) as any,
    props.presentation.id,
    generationStore.isStreaming,
    props.generationRequest
  );

  isInitialLoad.value = true;
  containerStore.initialize(props);

  // Reset save state on mount to ensure clean state
  if (containerStore.isRemote) {
    saveStore.reset();
  }

  if (containerStore.isRemote) {
    slidesStore.setSlides(containerStore.presentation?.slides || []);
  } else {
    const slides = await api.getFileData('slides');
    slidesStore.setSlides(slides);
  }

  await deleteDiscardedDB();
  snapshotStore.initSnapshotDatabase();

  isInitialLoad.value = false;
});

watch(
  slides,
  () => {
    if (containerStore.isRemote && containerStore.mode === 'edit') {
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
