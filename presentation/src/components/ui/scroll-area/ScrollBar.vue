<script setup lang="ts">
import type { ScrollAreaScrollbarProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { ScrollAreaScrollbar, ScrollAreaThumb } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = withDefaults(defineProps<ScrollAreaScrollbarProps & { class?: HTMLAttributes['class'] }>(), {
  orientation: 'vertical',
});

const delegatedProps = reactiveOmit(props, 'class');
</script>

<template>
  <ScrollAreaScrollbar
    data-slot="scroll-area-scrollbar"
    v-bind="delegatedProps"
    :class="
      cn(
        'tw-flex tw-touch-none tw-select-none tw-p-px tw-transition-colors',
        orientation === 'vertical' && 'tw-w-2.5 tw-border-l tw-border-l-transparent h-full',
        orientation === 'horizontal' && 'tw-flex-col tw-border-t tw-border-t-transparent h-2.5',
        props.class
      )
    "
  >
    <ScrollAreaThumb
      data-slot="scroll-area-thumb"
      class="tw-bg-border tw-relative tw-flex-1 tw-rounded-full"
    />
  </ScrollAreaScrollbar>
</template>
