<template>
  <div class="pptist-screen">
    <BaseView :changeViewMode="changeViewMode" v-if="viewMode === 'base'" />
    <PresenterView :changeViewMode="changeViewMode" v-else-if="viewMode === 'presenter'" />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { KEYS } from '@/configs/hotkey';
import useScreening from '@/hooks/useScreening';

import BaseView from './BaseView.vue';
import PresenterView from './PresenterView.vue';
import { useScreenStore } from '@/store';

const prop = defineProps<{
  isPresentingInitial?: boolean;
}>();

const viewMode = ref<'base' | 'presenter'>(prop.isPresentingInitial ? 'presenter' : 'base');
const screenStore = useScreenStore();

const changeViewMode = (mode: 'base' | 'presenter') => {
  viewMode.value = mode;
  screenStore.setPresenter(mode === 'presenter');
};

const { exitScreening } = useScreening();

// Hotkey to exit presentation
const keydownListener = (e: KeyboardEvent) => {
  const key = e.key.toUpperCase();
  if (key === KEYS.ESC) exitScreening();
};

onMounted(() => document.addEventListener('keydown', keydownListener));
onUnmounted(() => document.removeEventListener('keydown', keydownListener));
</script>

<style lang="scss" scoped>
.pptist-screen {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
