<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { NumberFieldInput } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <NumberFieldInput
    data-slot="input"
    :class="
      cn(
        'tw-border-input placeholder:tw-text-muted-foreground focus-visible:tw-ring-ring tw-flex tw-h-9 tw-w-full tw-rounded-md tw-border tw-bg-transparent tw-py-1 tw-text-center tw-text-sm tw-shadow-sm tw-transition-colors focus-visible:tw-outline-none focus-visible:tw-ring-1 disabled:tw-cursor-not-allowed disabled:tw-opacity-50',
        props.class
      )
    "
  />
</template>
