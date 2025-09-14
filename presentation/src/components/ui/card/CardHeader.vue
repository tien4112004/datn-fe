<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <div
    data-slot="card-header"
    :class="
      cn(
        '@container/card-header has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 tw-grid tw-auto-rows-min tw-grid-rows-[auto_auto] tw-items-start tw-gap-1.5 tw-px-6',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
