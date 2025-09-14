<script setup lang="ts">
import type { TooltipContentEmits, TooltipContentProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { TooltipArrow, TooltipContent, TooltipPortal, useForwardPropsEmits } from 'reka-ui';
import { cn } from '@/lib/utils';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<TooltipContentProps & { class?: HTMLAttributes['class'] }>(), {
  sideOffset: 4,
});

const emits = defineEmits<TooltipContentEmits>();

const delegatedProps = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <TooltipPortal>
    <TooltipContent
      data-slot="tooltip-content"
      v-bind="{ ...forwarded, ...$attrs }"
      :class="
        cn(
          'tw-bg-primary tw-text-primary-foreground tw-animate-in tw-fade-in-0 tw-zoom-in-95 data-[state=closed]:tw-animate-out data-[state=closed]:tw-fade-out-0 data-[state=closed]:tw-zoom-out-95 data-[side=bottom]:tw-slide-in-from-top-2 data-[side=left]:tw-slide-in-from-right-2 data-[side=right]:tw-slide-in-from-left-2 data-[side=top]:tw-slide-in-from-bottom-2 tw-z-50 tw-w-fit tw-text-balance tw-rounded-md tw-px-3 tw-py-1.5 tw-text-xs',
          props.class
        )
      "
    >
      <slot />

      <TooltipArrow
        class="tw-bg-primary tw-fill-primary tw-z-50 tw-size-2.5 tw-translate-y-[calc(-50%_-_2px)] tw-rotate-45 tw-rounded-[2px]"
      />
    </TooltipContent>
  </TooltipPortal>
</template>
