<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <div
    :class="
      cn(
        'tw-relative [&>[data-slot=input]]:has-[[data-slot=decrement]]:tw-pl-5 [&>[data-slot=input]]:has-[[data-slot=increment]]:tw-pr-5',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
