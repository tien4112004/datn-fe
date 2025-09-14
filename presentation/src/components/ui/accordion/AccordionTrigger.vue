<script setup lang="ts">
import type { AccordionTriggerProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { ChevronDown } from 'lucide-vue-next';
import { AccordionHeader, AccordionTrigger } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<AccordionTriggerProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = reactiveOmit(props, 'class');
</script>

<template>
  <AccordionHeader class="tw-flex">
    <AccordionTrigger
      data-slot="accordion-trigger"
      v-bind="delegatedProps"
      :class="
        cn(
          'focus-visible:tw-border-ring focus-visible:tw-ring-ring/50 tw-flex tw-flex-1 tw-items-start tw-justify-between tw-gap-4 tw-rounded-md tw-py-4 tw-text-left tw-text-sm tw-font-medium tw-outline-none tw-transition-all hover:tw-underline focus-visible:tw-ring-[3px] disabled:tw-pointer-events-none disabled:tw-opacity-50 [&[data-state=open]>svg]:tw-rotate-180',
          props.class
        )
      "
    >
      <slot />
      <slot name="icon">
        <ChevronDown
          class="tw-text-muted-foreground tw-pointer-events-none tw-size-4 tw-shrink-0 tw-translate-y-0.5 tw-transition-transform tw-duration-200"
        />
      </slot>
    </AccordionTrigger>
  </AccordionHeader>
</template>
