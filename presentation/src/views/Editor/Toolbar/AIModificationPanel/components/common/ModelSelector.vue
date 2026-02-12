<template>
  <InputGroup label="Image Generation Model">
    <div v-if="isLoading" class="loading-state">Loading models...</div>
    <select v-else v-model="selectedModel" class="model-select" :disabled="isProcessing">
      <option v-for="model in models" :key="`${model.provider}-${model.name}`" :value="model">
        {{ model.displayName || model.name }} ({{ model.provider }})
      </option>
    </select>
    <div v-if="models.length === 0 && !isLoading" class="warning-text">
      No IMAGE models available. Using default.
    </div>
  </InputGroup>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import InputGroup from './InputGroup.vue';

interface Model {
  name: string;
  provider: string;
  displayName?: string;
}

interface Props {
  modelValue: Model;
  models: Model[];
  isLoading?: boolean;
  isProcessing?: boolean;
}

interface Emits {
  (e: 'update:modelValue', model: Model): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const selectedModel = computed({
  get: () => props.modelValue,
  set: (value: Model) => emit('update:modelValue', value),
});
</script>

<style lang="scss" scoped>
.model-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--presentation-border);
  border-radius: 6px;
  background: var(--presentation-input);
  color: var(--presentation-foreground);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;

  &:hover:not(:disabled) {
    border-color: var(--presentation-primary);
  }

  &:disabled {
    background: var(--presentation-card);
    cursor: not-allowed;
    opacity: 0.6;
  }

  &:focus {
    outline: none;
    border-color: var(--presentation-primary);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  option {
    background: var(--presentation-input);
    color: var(--presentation-foreground);
  }
}

.loading-state {
  padding: 8px 12px;
  color: var(--presentation-muted-foreground);
  font-size: 14px;
  font-style: italic;
}

.warning-text {
  margin-top: 4px;
  color: #f59e0b;
  font-size: 12px;
}
</style>
