<template>
  <Button
    :checked="!disabled && _value === value"
    :disabled="disabled"
    type="radio"
    @click="!disabled && updateValue(value)"
    :class="
      cn('transition-colors', {
        'text-primary-foreground bg-primary hover:text-primary-foreground': !disabled && _value === value,
        'hover:text-primary hover:border-primary': !disabled && _value !== value,
      })
    "
  >
    <slot></slot>
  </Button>
</template>

<script lang="ts" setup>
import { inject } from 'vue';
import { injectKeyRadioGroupValue, type RadioGroupValue } from '@/types/injectKey';
import { cn } from '@/lib/utils';
import Button from './Button.vue';

const { value: _value, updateValue } = inject(injectKeyRadioGroupValue) as RadioGroupValue;

withDefaults(
  defineProps<{
    value: string;
    disabled?: boolean;
  }>(),
  {
    disabled: false,
  }
);
</script>
