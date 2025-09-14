<script setup lang="ts">
import type { ComboboxSeparatorProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { ComboboxSeparator } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<ComboboxSeparatorProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = reactiveOmit(props, 'class');
</script>

<template>
  <ComboboxSeparator
    data-slot="combobox-separator"
    v-bind="delegatedProps"
    :class="cn('tw-bg-border tw-h-px -mx-1', props.class)"
  >
    <slot />
  </ComboboxSeparator>
</template>
