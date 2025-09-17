<script setup lang="ts">
import type { SeparatorProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { Separator } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = withDefaults(defineProps<SeparatorProps & { class?: HTMLAttributes['class'] }>(), {
  orientation: 'horizontal',
  decorative: true,
});

const delegatedProps = reactiveOmit(props, 'class');
</script>

<template>
  <Separator
    data-slot="separator-root"
    v-bind="delegatedProps"
    :class="
      cn(
        `tw-bg-border tw-shrink-0 data-[orientation=horizontal]:tw-h-px data-[orientation=vertical]:tw-h-full data-[orientation=horizontal]:tw-w-full data-[orientation=vertical]:tw-w-px`,
        props.class
      )
    "
  />
</template>
