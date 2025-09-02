<template>
  <ToggleGroup
    class="radio-group"
    type="single"
    variant="outline"
    :model-value="value"
    @update:model-value="handleUpdateValue"
    :disabled="disabled"
  >
    <slot></slot>
  </ToggleGroup>
</template>

<script lang="ts" setup>
import { computed, provide } from 'vue';
import { injectKeyRadioGroupValue } from '@/types/injectKey';
import { ToggleGroup } from '@/components/ui/toggle-group';

const props = withDefaults(
  defineProps<{
    value: string;
    disabled?: boolean;
  }>(),
  {
    disabled: false,
  }
);

const emit = defineEmits<{
  (event: 'update:value', payload: string): void;
}>();

// Handle ToggleGroup's model-value update events
// ToggleGroup emits AcceptableValue which can be string | number | null for single type
const handleUpdateValue = (newValue: any) => {
  if (props.disabled || !newValue) return;
  // Convert to string to maintain API compatibility
  const stringValue = typeof newValue === 'string' ? newValue : String(newValue);
  emit('update:value', stringValue);
};

const updateValue = (value: string) => {
  if (props.disabled) return;
  emit('update:value', value);
};

const value = computed(() => props.value);

// Maintain backward compatibility by providing the injection key
// This allows existing RadioButton components to continue working
provide(injectKeyRadioGroupValue, {
  value,
  updateValue,
});
</script>
