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
        'tw-@container/card-header has-data-[slot=card-action]:tw-grid-cols-[1fr_auto] [.tw-border-b]:tw-pb-6 tw-grid tw-auto-rows-min tw-grid-rows-[auto_auto] tw-items-start tw-gap-1.5 tw-px-6',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
