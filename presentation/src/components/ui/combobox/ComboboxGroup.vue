<script setup lang="ts">
import type { ComboboxGroupProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { ComboboxGroup, ComboboxLabel } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<
  ComboboxGroupProps & {
    class?: HTMLAttributes['class'];
    heading?: string;
  }
>();

const delegatedProps = reactiveOmit(props, 'class');
</script>

<template>
  <ComboboxGroup
    data-slot="combobox-group"
    v-bind="delegatedProps"
    :class="cn('tw-text-foreground tw-overflow-hidden tw-p-1', props.class)"
  >
    <ComboboxLabel
      v-if="heading"
      class="tw-text-muted-foreground tw-px-2 tw-py-1.5 tw-text-xs tw-font-medium"
    >
      {{ heading }}
    </ComboboxLabel>
    <slot />
  </ComboboxGroup>
</template>
