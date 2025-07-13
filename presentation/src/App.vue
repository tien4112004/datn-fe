<template>
  <template v-if="slides.length">
    <Screen v-if="screening" />
    <Editor v-else-if="_isPC" />
    <Mobile v-else />
  </template>
  <FullscreenSpin tip="Initializing data, please wait..." v-else loading :mask="false" class="spin" />

  <!-- Stagewise Toolbar - only in development mode -->
  <StagewiseToolbar v-if="isDev" :config="stagewiseConfig" />
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useScreenStore, useMainStore, useSnapshotStore, useSlidesStore } from '@/store';
import { LOCALSTORAGE_KEY_DISCARDED_DB } from '@/configs/storage';
import { deleteDiscardedDB } from '@/utils/database';
import { isPC } from '@/utils/common';
import api from '@/services';

import Editor from './views/Editor/index.vue';
import Screen from './views/Screen/index.vue';
import Mobile from './views/Mobile/index.vue';
import FullscreenSpin from '@/components/FullscreenSpin.vue';

// Stagewise imports
import { StagewiseToolbar } from '@stagewise/toolbar-vue';
import VuePlugin from '@stagewise-plugins/vue';

const _isPC = isPC();

// Stagewise configuration
const isDev = import.meta.env.DEV;
const stagewiseConfig = {
  plugins: [VuePlugin],
};

const mainStore = useMainStore();
const slidesStore = useSlidesStore();
const snapshotStore = useSnapshotStore();
const { databaseId } = storeToRefs(mainStore);
const { slides } = storeToRefs(slidesStore);
const { screening } = storeToRefs(useScreenStore());

if (import.meta.env.MODE !== 'development') {
  window.onbeforeunload = () => false;
}

onMounted(async () => {
  const slides = await api.getFileData('slides');
  slidesStore.setSlides(slides);

  await deleteDiscardedDB();
  snapshotStore.initSnapshotDatabase();
});

// When the application is unloaded, record the current indexedDB database ID in localStorage for later database cleanup
window.addEventListener('unload', () => {
  const discardedDB = localStorage.getItem(LOCALSTORAGE_KEY_DISCARDED_DB);
  const discardedDBList: string[] = discardedDB ? JSON.parse(discardedDB) : [];

  discardedDBList.push(databaseId.value);

  const newDiscardedDB = JSON.stringify(discardedDBList);
  localStorage.setItem(LOCALSTORAGE_KEY_DISCARDED_DB, newDiscardedDB);
});
</script>

<style lang="scss">
#app {
  height: 100%;
  max-height: 100%;
  overflow-y: auto;
}
</style>
