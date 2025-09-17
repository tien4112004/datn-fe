<script setup lang="ts">
import type { DropdownMenuCheckboxItemEmits, DropdownMenuCheckboxItemProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { Check } from 'lucide-vue-next';
import { DropdownMenuCheckboxItem, DropdownMenuItemIndicator, useForwardPropsEmits } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<DropdownMenuCheckboxItemProps & { class?: HTMLAttributes['class'] }>();
const emits = defineEmits<DropdownMenuCheckboxItemEmits>();

const delegatedProps = reactiveOmit(props, 'class');

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <DropdownMenuCheckboxItem
    data-slot="dropdown-menu-checkbox-item"
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
        <Check class="tw-size-4" />
      </DropdownMenuItemIndicator>
    </span>
    <slot />
  </DropdownMenuCheckboxItem>
</template>
