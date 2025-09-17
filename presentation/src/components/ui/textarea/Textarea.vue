<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { useVModel } from '@vueuse/core';
import { cn } from '@/lib/utils';

const props = defineProps<{
  class?: HTMLAttributes['class'];
  defaultValue?: string | number;
  modelValue?: string | number;
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
  <textarea
    v-model="modelValue"
    data-slot="textarea"
    :class="
      cn(
        'tw-border-input placeholder:tw-text-muted-foreground focus-visible:tw-border-ring focus-visible:tw-ring-ring/50 aria-invalid:tw-ring-destructive/20 dark:aria-invalid:tw-ring-destructive/40 aria-invalid:tw-border-destructive dark:tw-bg-input/30 tw-field-sizing-content tw-shadow-xs tw-flex tw-min-h-16 tw-w-full tw-rounded-md tw-border tw-bg-transparent tw-px-3 tw-py-2 tw-text-base tw-outline-none tw-transition-[color,box-shadow] focus-visible:tw-ring-[3px] disabled:tw-cursor-not-allowed disabled:tw-opacity-50 md:tw-text-sm',
        props.class
      )
    "
  />
</template>
