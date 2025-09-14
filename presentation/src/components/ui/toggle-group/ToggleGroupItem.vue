<script setup lang="ts">
import type { VariantProps } from 'class-variance-authority';
import type { ToggleGroupItemProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { ToggleGroupItem, useForwardProps } from 'reka-ui';
import { inject } from 'vue';
import { cn } from '@/lib/utils';
import { toggleVariants } from '@/components/ui/toggle';

type ToggleGroupVariants = VariantProps<typeof toggleVariants>;

const props = defineProps<
  ToggleGroupItemProps & {
    class?: HTMLAttributes['class'];
    variant?: ToggleGroupVariants['variant'];
    size?: ToggleGroupVariants['size'];
  }
>();

const context = inject<ToggleGroupVariants>('toggleGroup');

const delegatedProps = reactiveOmit(props, 'class', 'size', 'variant');
const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <ToggleGroupItem
    v-slot="slotProps"
    data-slot="toggle-group-item"
    :data-variant="context?.variant || variant"
    :data-size="context?.size || size"
    v-bind="forwardedProps"
    :class="
      cn(
        toggleVariants({ variant: context?.variant || variant, size: context?.size || size }),
        'tw-min-w-0 tw-flex-1 tw-shrink-0 tw-rounded-none tw-shadow-none first:tw-rounded-l-md last:tw-rounded-r-md focus:tw-z-10 focus-visible:tw-z-10 data-[variant=outline]:tw-border-l-0 data-[variant=outline]:first:tw-border-l',
        props.class
      )
    "
  >
    <slot v-bind="slotProps" />
  </ToggleGroupItem>
</template>
