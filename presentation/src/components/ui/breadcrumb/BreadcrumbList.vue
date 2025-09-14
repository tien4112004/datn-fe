<script lang="ts" setup>
import type { HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <ol
    data-slot="breadcrumb-list"
    :class="
      cn(
        'tw-text-muted-foreground tw-flex tw-flex-wrap tw-items-center tw-gap-1.5 tw-break-words tw-text-sm sm:tw-gap-2.5',
        props.class
      )
    "
  >
    <slot />
  </ol>
</template>
