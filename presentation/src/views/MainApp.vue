<template>
  <template v-if="slides.length">
    <Screen v-if="screening" />
    <Editor v-else-if="_isPC" />
    <Mobile v-else />
  </template>
  <!-- <FullscreenSpin :tip="$t('app.initializing')" v-else loading :mask="false" class="spin" /> -->
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

import Editor from './Editor/index.vue';
import Mobile from './Mobile/index.vue';
import Screen from './Screen/index.vue';
import FullscreenSpin from '@/components/FullscreenSpin.vue';
import type { Presentation } from '../types/slides';

const _isPC = isPC();

const props = defineProps<{
  titleTest: string;
  isRemote: boolean;
  presentation: Presentation;
}>();

const mainStore = useMainStore();
const slidesStore = useSlidesStore();
const snapshotStore = useSnapshotStore();
const containerStore = useContainerStore();
const saveStore = useSaveStore();
const { databaseId } = storeToRefs(mainStore);
const { slides } = storeToRefs(slidesStore);
const { screening } = storeToRefs(useScreenStore());

// Track if this is the initial load to avoid marking as dirty
let isInitialLoad = ref(true);

onMounted(async () => {
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

  // After initial load is complete, allow dirty tracking
  setTimeout(() => {
    isInitialLoad.value = false;
  }, 500);

  // Handle browser/tab close with unsaved changes
  // Note: Browsers only allow generic messages, not custom dialogs
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (containerStore.isRemote && saveStore.hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = '';
      return '';
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
});

watch(
  slides,
  () => {
    if (containerStore.isRemote) {
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
// Styles are in App.vue
</style>
