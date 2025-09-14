<script setup lang="ts">
import type { NumberFieldDecrementProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { Minus } from 'lucide-vue-next';
import { NumberFieldDecrement, useForwardProps } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<NumberFieldDecrementProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = reactiveOmit(props, 'class');

const forwarded = useForwardProps(delegatedProps);
</script>

<template>
  <NumberFieldDecrement
    data-slot="decrement"
    v-bind="forwarded"
    :class="
      cn(
        'tw-absolute tw-left-0 tw-top-1/2 tw-p-3 disabled:tw-cursor-not-allowed disabled:tw-opacity-20 -translate-y-1/2',
        props.class
      )
    "
  >
    <slot>
      <Minus class="tw-h-4 tw-w-4" />
    </slot>
  </NumberFieldDecrement>
</template>
