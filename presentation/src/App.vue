<template>
  <template v-if="slides.length || isDemo">
    <Screen v-if="screening" />
    <router-view v-else />
  </template>
  <FullscreenSpin :tip="$t('app.initializing')" v-else loading :mask="false" class="spin" />
</template>

<script lang="ts" setup>
import { onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { useScreenStore, useMainStore, useSnapshotStore, useSlidesStore, useContainerStore } from '@/store';
import { LOCALSTORAGE_KEY_DISCARDED_DB } from '@/configs/storage';
import { deleteDiscardedDB } from '@/utils/database';
import { isPC } from '@/utils/common';
import api from '@/services';
//
import Screen from './views/Screen/index.vue';
import FullscreenSpin from '@/components/FullscreenSpin.vue';
import type { Presentation } from './types/slides';

const route = useRoute();
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
const { databaseId } = storeToRefs(mainStore);
const { slides } = storeToRefs(slidesStore);
const { screening } = storeToRefs(useScreenStore());

// Check if current route is demo to allow access without slides
const isDemo = computed(() => route.name === 'demo');

if (import.meta.env.MODE !== 'development') {
  window.onbeforeunload = () => false;
}

onMounted(async () => {
  containerStore.initialize(props);

  if (containerStore.isRemote) {
    console.log('Presentation data in App.vue:', containerStore.presentation);
    slidesStore.setSlides(containerStore.presentation?.slides || []);
  } else {
    const slides = await api.getFileData('slides');
    slidesStore.setSlides(slides);
  }

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
