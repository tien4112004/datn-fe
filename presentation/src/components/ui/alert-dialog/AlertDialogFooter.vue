<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <div
    data-slot="alert-dialog-footer"
    :class="cn('tw-flex tw-flex-col-reverse tw-gap-2 sm:tw-flex-row sm:tw-justify-end', props.class)"
  >
    <slot />
  </div>
</template>
