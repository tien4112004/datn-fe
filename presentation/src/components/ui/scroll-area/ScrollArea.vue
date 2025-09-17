<script setup lang="ts">
import type { ScrollAreaRootProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { ScrollAreaCorner, ScrollAreaRoot, ScrollAreaViewport } from 'reka-ui';
import { cn } from '@/lib/utils';
import ScrollBar from './ScrollBar.vue';

const props = defineProps<ScrollAreaRootProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = reactiveOmit(props, 'class');
</script>

<template>
  <ScrollAreaRoot data-slot="scroll-area" v-bind="delegatedProps" :class="cn('tw-relative', props.class)">
    <ScrollAreaViewport
      data-slot="scroll-area-viewport"
      class="focus-visible:tw-ring-ring/50 tw-size-full tw-rounded-[inherit] tw-outline-none tw-transition-[color,box-shadow] focus-visible:tw-outline-1 focus-visible:tw-ring-[3px]"
    >
      <slot />
    </ScrollAreaViewport>
    <ScrollBar />
    <ScrollAreaCorner />
  </ScrollAreaRoot>
</template>
