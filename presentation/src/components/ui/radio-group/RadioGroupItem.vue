<script setup lang="ts">
import type { RadioGroupItemProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { CircleIcon } from 'lucide-vue-next';
import { RadioGroupIndicator, RadioGroupItem, useForwardProps } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<RadioGroupItemProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = reactiveOmit(props, 'class');

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <RadioGroupItem
    data-slot="radio-group-item"
    v-bind="forwardedProps"
    :class="
      cn(
        'tw-border-input tw-text-primary focus-visible:tw-border-ring focus-visible:tw-ring-ring/50 aria-invalid:tw-ring-destructive/20 dark:aria-invalid:tw-ring-destructive/40 aria-invalid:tw-border-destructive dark:tw-bg-input/30 tw-shadow-xs tw-aspect-square tw-size-4 tw-shrink-0 tw-rounded-full tw-border tw-outline-none tw-transition-[color,box-shadow] focus-visible:tw-ring-[3px] disabled:tw-cursor-not-allowed disabled:tw-opacity-50',
        props.class
      )
    "
  >
    <RadioGroupIndicator
      data-slot="radio-group-indicator"
      class="tw-relative tw-flex tw-items-center tw-justify-center"
    >
      <CircleIcon
        class="tw-fill-primary tw-absolute tw-left-1/2 tw-top-1/2 tw-size-2 -translate-x-1/2 -translate-y-1/2"
      />
    </RadioGroupIndicator>
  </RadioGroupItem>
</template>
