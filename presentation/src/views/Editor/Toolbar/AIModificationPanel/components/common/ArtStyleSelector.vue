<template>
  <InputGroup label="Art Style">
    <div class="style-grid">
      <button
        v-for="style in artStyleOptions"
        :key="style.value"
        class="style-chip"
        :class="{ active: modelValue === style.value }"
        @click="$emit('update:modelValue', style.value)"
        :disabled="disabled"
      >
        {{ style.label }}
      </button>
    </div>
  </InputGroup>
</template>

<script lang="ts" setup>
import InputGroup from './InputGroup.vue';

interface ArtStyle {
  value: string;
  label: string;
}

interface Props {
  modelValue: string;
  artStyleOptions: ArtStyle[];
  disabled?: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
}

defineProps<Props>();
defineEmits<Emits>();
</script>

<style lang="scss" scoped>
.style-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.style-chip {
  padding: 4px 10px;
  border-radius: 99px;
  border: 1px solid var(--presentation-border);
  background: var(--presentation-card);
  color: var(--presentation-foreground);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover:not(:disabled) {
    border-color: var(--presentation-primary);
    color: var(--presentation-primary);
  }

  &.active {
    border-color: var(--presentation-primary);
    background: rgba(37, 99, 235, 0.06);
    color: var(--presentation-primary);
    font-weight: 600;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
