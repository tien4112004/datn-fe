<template>
  <router-view v-slot="{ Component }">
    <component :is="Component" v-bind="componentProps" />
  </router-view>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import type { Presentation } from './types/slides';

const props = defineProps<{
  titleTest: string;
  isRemote: boolean;
  presentation: Presentation;
  mode: 'view' | 'edit';
}>();

// Pass props to routed components
const componentProps = computed(() => ({
  titleTest: props.titleTest,
  isRemote: props.isRemote,
  presentation: props.presentation,
}));
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
