<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { useVModel } from '@vueuse/core';
import { cn } from '@/lib/utils';

const props = defineProps<{
  defaultValue?: string | number;
  modelValue?: string | number;
  class?: HTMLAttributes['class'];
}>();

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void;
}>();

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
});
</script>

<template>
  <input
    v-model="modelValue"
    data-slot="input"
    :class="
      cn(
        'file:tw-text-foreground placeholder:tw-text-muted-foreground selection:tw-bg-primary selection:tw-text-primary-foreground dark:tw-bg-input/30 tw-border-input tw-shadow-xs tw-flex tw-h-9 tw-w-full tw-min-w-0 tw-rounded-md tw-border tw-bg-transparent tw-px-3 tw-py-1 tw-text-base tw-outline-none tw-transition-[color,box-shadow] file:tw-inline-flex file:tw-h-7 file:tw-border-0 file:tw-bg-transparent file:tw-text-sm file:tw-font-medium disabled:tw-pointer-events-none disabled:tw-cursor-not-allowed disabled:tw-opacity-50 md:tw-text-sm',
        'focus-visible:tw-border-ring focus-visible:tw-ring-ring/50 focus-visible:tw-ring-[3px]',
        'aria-invalid:tw-ring-destructive/20 dark:aria-invalid:tw-ring-destructive/40 aria-invalid:tw-border-destructive',
        props.class
      )
    "
  />
</template>
