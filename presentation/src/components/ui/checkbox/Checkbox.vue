<script setup lang="ts">
import type { CheckboxRootEmits, CheckboxRootProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { Check } from 'lucide-vue-next';
import { CheckboxIndicator, CheckboxRoot, useForwardPropsEmits } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<CheckboxRootProps & { class?: HTMLAttributes['class'] }>();
const emits = defineEmits<CheckboxRootEmits>();

const delegatedProps = reactiveOmit(props, 'class');

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <CheckboxRoot
    data-slot="checkbox"
    v-bind="forwarded"
    :class="
      cn(
        'tw-border-input data-[state=checked]:tw-bg-primary data-[state=checked]:tw-text-primary-foreground data-[state=checked]:tw-border-primary focus-visible:tw-border-ring focus-visible:tw-ring-ring/50 aria-invalid:tw-ring-destructive/20 dark:aria-invalid:tw-ring-destructive/40 aria-invalid:tw-border-destructive tw-shadow-xs tw-size-4 tw-shrink-0 tw-rounded-[4px] tw-border tw-outline-none tw-transition-shadow focus-visible:tw-ring-[3px] disabled:tw-cursor-not-allowed disabled:tw-opacity-50 peer',
        props.class
      )
    "
  >
    <CheckboxIndicator
      data-slot="checkbox-indicator"
      class="tw-flex tw-items-center tw-justify-center tw-text-current tw-transition-none"
    >
      <slot>
        <Check class="tw-size-3.5" />
      </slot>
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
