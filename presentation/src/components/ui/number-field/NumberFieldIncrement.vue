<script setup lang="ts">
import type { NumberFieldIncrementProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { Plus } from 'lucide-vue-next';
import { NumberFieldIncrement, useForwardProps } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<NumberFieldIncrementProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = reactiveOmit(props, 'class');

const forwarded = useForwardProps(delegatedProps);
</script>

<template>
  <NumberFieldIncrement
    data-slot="increment"
    v-bind="forwarded"
    :class="
      cn(
        'tw-absolute tw-right-0 tw-top-1/2 tw--translate-y-1/2 tw-p-3 disabled:tw-cursor-not-allowed disabled:tw-opacity-20',
        props.class
      )
    "
  >
    <slot>
      <Plus class="tw-h-4 tw-w-4" />
    </slot>
  </NumberFieldIncrement>
</template>
