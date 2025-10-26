<script setup lang="ts">
import type { TabsTriggerProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { TabsTrigger, useForwardProps } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<TabsTriggerProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = reactiveOmit(props, 'class');

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <TabsTrigger
    data-slot="tabs-trigger"
    v-bind="forwardedProps"
    :class="
      cn(
        `data-[state=active]:tw-bg-background dark:data-[state=active]:tw-text-foreground focus-visible:tw-border-ring focus-visible:tw-ring-ring/50 focus-visible:tw-outline-ring dark:data-[state=active]:tw-border-input dark:data-[state=active]:tw-bg-input/30 tw-text-foreground dark:tw-text-muted-foreground tw-h-[calc(100%-1px)] tw-flex-1 tw-items-center tw-justify-center tw-gap-1.5 tw-whitespace-nowrap tw-px-2 tw-py-1 tw-text-sm tw-font-medium disabled:tw-pointer-events-none disabled:tw-opacity-50 data-[state=active]:tw-shadow-sm tw-inline-flex tw-transition-[color,box-shadow] focus-visible:tw-outline-1 focus-visible:tw-ring-[3px] [&_svg:not([class*='size-'])]:tw-size-4 [&_svg]:tw-pointer-events-none [&_svg]:tw-shrink-0`,
        'tw-rounded-md tw-border tw-border-transparent hover:tw-border-accent hover:tw-border-1 hover:tw-text-accent',
        props.class
      )
    "
  >
    <slot />
  </TabsTrigger>
</template>
