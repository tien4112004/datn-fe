<script setup lang="ts">
import type { ComboboxItemEmits, ComboboxItemProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { ComboboxItem, useForwardPropsEmits } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<ComboboxItemProps & { class?: HTMLAttributes['class'] }>();
const emits = defineEmits<ComboboxItemEmits>();

const delegatedProps = reactiveOmit(props, 'class');

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <ComboboxItem
    data-slot="combobox-item"
    v-bind="forwarded"
    :class="
      cn(
        `data-[highlighted]:tw-bg-accent data-[highlighted]:tw-text-accent-foreground [&_svg:not([class*='text-'])]:tw-text-muted-foreground tw-outline-hidden tw-relative tw-flex tw-cursor-default tw-select-none tw-items-center tw-gap-2 tw-rounded-sm tw-px-2 tw-py-1.5 tw-text-sm data-[disabled=true]:tw-pointer-events-none data-[disabled=true]:tw-opacity-50 [&_svg:not([class*='size-'])]:tw-size-4 [&_svg]:tw-pointer-events-none [&_svg]:tw-shrink-0`,
        props.class
      )
    "
  >
    <slot />
  </ComboboxItem>
</template>
