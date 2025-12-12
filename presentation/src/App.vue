<template>
  <router-view v-slot="{ Component }">
    <component :is="Component" v-bind="componentProps" />
  </router-view>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import type { Presentation } from './types/slides';

const props = defineProps<{
  isRemote: boolean;
  presentation: Presentation;
  mode: 'view' | 'edit';
}>();

// Pass props to routed components
const componentProps = computed(() => ({
  isRemote: props.isRemote,
  presentation: props.presentation,
  mode: props.mode,
}));
</script>
