<template>
  <label class="toggle-row">
    <input
      type="checkbox"
      :checked="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
      class="toggle-checkbox"
      :disabled="disabled"
    />
    <span>{{ label }}</span>
  </label>
</template>

<script lang="ts" setup>
interface Props {
  modelValue: boolean;
  label: string;
  disabled?: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
}

defineProps<Props>();
defineEmits<Emits>();
</script>

<style lang="scss" scoped>
.toggle-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--presentation-foreground);
  cursor: pointer;

  .toggle-checkbox {
    accent-color: var(--presentation-primary);
    cursor: pointer;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }

  &:has(.toggle-checkbox:disabled) {
    cursor: not-allowed;
    opacity: 0.6;
  }
}
</style>
