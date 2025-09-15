<script setup lang="ts">
import type { LabelProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { Label } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<LabelProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = reactiveOmit(props, 'class');
</script>

<template>
  <Label
    data-slot="label"
    v-bind="delegatedProps"
    :class="
      cn(
        'tw-flex tw-select-none tw-items-center tw-gap-2 tw-text-sm tw-font-medium tw-leading-none peer-disabled:tw-cursor-not-allowed peer-disabled:tw-opacity-50 group-data-[disabled=true]:tw-pointer-events-none group-data-[disabled=true]:tw-opacity-50',
        props.class
      )
    "
  >
    <slot />
  </Label>
</template>
