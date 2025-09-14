<template>
  <ToggleGroup
    class="radio-group"
    type="single"
    variant="outline"
    :value="value"
    @update:value="handleUpdateValue"
    :disabled="disabled"
    :class="className"
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

const handleUpdateValue = (newValue: any) => {
  if (props.disabled || !newValue) return;
  const stringValue = typeof newValue === 'string' ? newValue : String(newValue);
  emit('update:value', stringValue);
};

const updateValue = (value: string) => {
  if (props.disabled) return;
  emit('update:value', value);
};

const value = computed(() => props.value);
const className = computed(() => 'radio-group');

provide(injectKeyRadioGroupValue, {
  value,
  updateValue,
});
</script>

<style scoped>
.radio-group > *:first-child {
  border-radius: var(--presentation-radius) 0 0 var(--presentation-radius);
}

.radio-group > *:last-child {
  border-radius: 0 var(--presentation-radius) var(--presentation-radius) 0;
}

.radio-group > *:not(:first-child):not(:last-child) {
  border-radius: 0;
}
</style>
