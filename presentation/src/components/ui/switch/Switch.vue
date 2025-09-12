<script setup lang="ts">
import type { SwitchRootEmits, SwitchRootProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { SwitchRoot, SwitchThumb, useForwardPropsEmits } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<
  SwitchRootProps & {
    class?: HTMLAttributes['class'];
    size?: 'small' | 'medium';
  }
>();

const emits = defineEmits<SwitchRootEmits>();

const delegatedProps = reactiveOmit(props, 'class');

const forwarded = useForwardPropsEmits(delegatedProps, emits);

// Size variants
const sizeClasses = {
  small: {
    root: 'h-[1.15rem] w-10 ',
    thumb: 'size-4 data-[state=checked]:translate-x-[calc(100%+5px)]',
  },
  medium: {
    root: 'h-[1.5rem] w-12 ',
    thumb: 'size-5 data-[state=checked]:translate-x-[calc(100%+4px)]',
  },
};

const currentSize = props.size || 'medium';
</script>

<template>
  <SwitchRoot
    data-slot="switch"
    v-bind="forwarded"
    :class="
      cn(
        'data-[state=checked]:bg-primary shadow-xs peer inline-flex shrink-0 items-center rounded-full border border-gray-300 outline-none transition-all focus-visible:border-blue-500 focus-visible:ring-[3px] focus-visible:ring-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=unchecked]:bg-gray-300 dark:border-gray-600 dark:data-[state=unchecked]:bg-gray-700',
        sizeClasses[currentSize].root,
        props.class
      )
    "
  >
    <SwitchThumb
      data-slot="switch-thumb"
      :class="
        cn(
          'pointer-events-none block rounded-full bg-white ring-0 transition-transform data-[state=unchecked]:translate-x-0 dark:data-[state=checked]:bg-white dark:data-[state=unchecked]:bg-gray-200',
          sizeClasses[currentSize].thumb
        )
      "
    >
      <slot name="thumb" />
    </SwitchThumb>
  </SwitchRoot>
</template>
