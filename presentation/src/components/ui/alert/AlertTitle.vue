<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <div
    data-slot="alert-title"
    :class="cn('tw-col-start-2 tw-line-clamp-1 tw-min-h-4 tw-font-medium tw-tracking-tight', props.class)"
  >
    <slot />
  </div>
</template>
