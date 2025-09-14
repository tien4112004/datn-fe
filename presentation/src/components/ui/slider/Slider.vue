<script setup lang="ts">
import type { SliderRootEmits, SliderRootProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { SliderRange, SliderRoot, SliderThumb, SliderTrack, useForwardPropsEmits } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<SliderRootProps & { class?: HTMLAttributes['class'] }>();
const emits = defineEmits<SliderRootEmits>();

const delegatedProps = reactiveOmit(props, 'class');

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <SliderRoot
    v-slot="{ modelValue }"
    data-slot="slider"
    :class="
      cn(
        'tw-relative tw-flex tw-w-full tw-touch-none tw-select-none tw-items-center data-[orientation=vertical]:tw-h-full data-[orientation=vertical]:tw-min-h-44 data-[orientation=vertical]:tw-w-auto data-[orientation=vertical]:tw-flex-col data-[disabled]:tw-opacity-50',
        props.class
      )
    "
    v-bind="forwarded"
  >
    <SliderTrack
      data-slot="slider-track"
      class="tw-bg-muted tw-relative tw-grow tw-overflow-hidden tw-rounded-full data-[orientation=horizontal]:tw-h-1.5 data-[orientation=vertical]:tw-h-full data-[orientation=horizontal]:tw-w-full data-[orientation=vertical]:tw-w-1.5"
    >
      <SliderRange
        data-slot="slider-range"
        class="tw-bg-primary tw-absolute data-[orientation=horizontal]:tw-h-full data-[orientation=vertical]:tw-w-full"
      />
    </SliderTrack>

    <SliderThumb
      v-for="(_, key) in modelValue"
      :key="key"
      data-slot="slider-thumb"
      class="tw-border-primary tw-ring-ring/50 focus-visible:tw-outline-hidden tw-block tw-size-4 tw-shrink-0 tw-rounded-full tw-border tw-bg-gray-100 tw-shadow-sm tw-transition-[color,box-shadow] hover:tw-ring-4 focus-visible:tw-ring-4 disabled:tw-pointer-events-none disabled:tw-opacity-50"
    />
  </SliderRoot>
</template>
