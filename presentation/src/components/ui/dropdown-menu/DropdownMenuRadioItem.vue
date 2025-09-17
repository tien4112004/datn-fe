<script setup lang="ts">
import type { DropdownMenuRadioItemEmits, DropdownMenuRadioItemProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { Circle } from 'lucide-vue-next';
import { DropdownMenuItemIndicator, DropdownMenuRadioItem, useForwardPropsEmits } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<DropdownMenuRadioItemProps & { class?: HTMLAttributes['class'] }>();

const emits = defineEmits<DropdownMenuRadioItemEmits>();

const delegatedProps = reactiveOmit(props, 'class');

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <DropdownMenuRadioItem
    data-slot="dropdown-menu-radio-item"
    v-bind="forwarded"
    :class="
      cn(
        `focus:tw-bg-accent focus:tw-text-accent-foreground tw-outline-hidden tw-relative tw-flex tw-cursor-default tw-select-none tw-items-center tw-gap-2 tw-rounded-sm tw-py-1.5 tw-pl-8 tw-pr-2 tw-text-sm data-[disabled]:tw-pointer-events-none data-[disabled]:tw-opacity-50 [&_svg:not([class*='size-'])]:tw-size-4 [&_svg]:tw-pointer-events-none [&_svg]:tw-shrink-0`,
        props.class
      )
    "
  >
    <span
      class="tw-pointer-events-none tw-absolute tw-left-2 tw-flex tw-size-3.5 tw-items-center tw-justify-center"
    >
      <DropdownMenuItemIndicator>
        <Circle class="tw-size-2 tw-fill-current" />
      </DropdownMenuItemIndicator>
    </span>
    <slot />
  </DropdownMenuRadioItem>
</template>
