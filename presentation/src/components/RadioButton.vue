<template>
  <ToggleGroupItem
    :value="value"
    :disabled="disabled"
    :class="
      cn('transition-colors', {
        'bg-primary text-primary-foreground hover:bg-primary/90': !disabled && _value === value,
        'hover:text-primary border-input hover:border-primary': !disabled && _value !== value,
      })
    "
  >
    <slot></slot>
  </ToggleGroupItem>
</template>

<script lang="ts" setup>
import { inject } from 'vue';
import { injectKeyRadioGroupValue, type RadioGroupValue } from '@/types/injectKey';
import { ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

// Maintain backward compatibility by still injecting the radio group context
// This allows the component to work with the existing API
const radioGroupContext = inject(injectKeyRadioGroupValue, null) as RadioGroupValue | null;
const _value = radioGroupContext?.value;
const updateValue = radioGroupContext?.updateValue;

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
