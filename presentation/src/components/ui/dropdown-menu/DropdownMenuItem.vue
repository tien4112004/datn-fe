<script setup lang="ts">
import type { DropdownMenuItemProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { DropdownMenuItem, useForwardProps } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = withDefaults(
  defineProps<
    DropdownMenuItemProps & {
      class?: HTMLAttributes['class'];
      inset?: boolean;
      variant?: 'default' | 'destructive';
    }
  >(),
  {
    variant: 'default',
  }
);

const delegatedProps = reactiveOmit(props, 'inset', 'variant', 'class');

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <DropdownMenuItem
    data-slot="dropdown-menu-item"
    :data-inset="inset ? '' : undefined"
    :data-variant="variant"
    v-bind="forwardedProps"
    :class="
      cn(
        `focus:tw-bg-accent focus:tw-text-accent-foreground data-[variant=destructive]:tw-text-destructive-foreground data-[variant=destructive]:focus:tw-bg-destructive/10 dark:data-[variant=destructive]:focus:tw-bg-destructive/40 data-[variant=destructive]:focus:tw-text-destructive-foreground data-[variant=destructive]:*:[svg]:!tw-text-destructive-foreground [&_svg:not([class*='text-'])]:tw-text-muted-foreground tw-outline-hidden tw-relative tw-flex tw-cursor-default tw-select-none tw-items-center tw-gap-2 tw-rounded-sm tw-px-2 tw-py-1.5 tw-text-sm data-[disabled]:tw-pointer-events-none data-[inset]:tw-pl-8 data-[disabled]:tw-opacity-50 [&_svg:not([class*='size-'])]:tw-size-4 [&_svg]:tw-pointer-events-none [&_svg]:tw-shrink-0`,
        props.class
      )
    "
  >
    <slot />
  </DropdownMenuItem>
</template>
