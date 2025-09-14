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
        'tw-flex tw-select-none tw-items-center tw-gap-2 tw-text-sm tw-font-medium tw-leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50',
        props.class
      )
    "
  >
    <slot />
  </Label>
</template>
