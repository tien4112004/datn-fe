<template>
  <div class="parameter-control">
    <label class="parameter-label">{{ parameter.name }}</label>

    <!-- Select Dropdown -->
    <Select
      v-if="parameter.type === 'select'"
      :value="String(modelValue)"
      @update:value="emit('update:modelValue', $event)"
      :options="selectOptions"
    />

    <!-- Radio Group -->
    <div v-else-if="parameter.type === 'radio'" class="radio-group">
      <div
        v-for="option in parameter.options"
        :key="option.value"
        class="radio-option"
        :class="{ active: modelValue === option.value }"
        @click="emit('update:modelValue', option.value)"
      >
        {{ option.label }}
      </div>
    </div>

    <!-- Slider -->
    <div v-else-if="parameter.type === 'slider'" class="slider-container">
      <input
        type="range"
        :value="modelValue"
        :min="parameter.min || 0"
        :max="parameter.max || 100"
        :step="parameter.step || 1"
        @input="emit('update:modelValue', Number(($event.target as HTMLInputElement).value))"
        class="slider"
      />
      <span class="slider-value">{{ modelValue }}</span>
    </div>

    <!-- Number Input -->
    <Input
      v-else-if="parameter.type === 'number'"
      type="number"
      :value="String(modelValue)"
      @input="emit('update:modelValue', Number(($event.target as HTMLInputElement).value))"
      :min="parameter.min"
      :max="parameter.max"
      :placeholder="parameter.placeholder"
    />

    <!-- Text Input -->
    <Input
      v-else-if="parameter.type === 'text'"
      type="text"
      :value="String(modelValue)"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      :placeholder="parameter.placeholder"
    />

    <!-- Textarea -->
    <textarea
      v-else-if="parameter.type === 'textarea'"
      :value="modelValue"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      :placeholder="parameter.placeholder"
      class="textarea"
      rows="3"
    />

    <p v-if="parameter.description" class="parameter-description">
      {{ parameter.description }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits, computed } from 'vue';
import type { AIParameter } from '@/types/aiModification';
import Select from '@/components/Select.vue';
import Input from '@/components/Input.vue';

interface Props {
  parameter: AIParameter;
  modelValue: string | number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
}>();

// Convert parameter options to Select component format
const selectOptions = computed(() => {
  return (
    props.parameter.options?.map((opt) => ({
      label: opt.label,
      value: String(opt.value),
    })) || []
  );
});
</script>

<style lang="scss" scoped>
.parameter-control {
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }
}

.parameter-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--presentation-foreground);
  margin-bottom: 0.5rem;
}

.parameter-description {
  font-size: 0.6875rem;
  color: var(--presentation-muted-foreground);
  margin-top: 0.375rem;
  margin-bottom: 0;
  line-height: 1.4;
}

.radio-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.radio-option {
  padding: 0.5rem 0.875rem;
  border: 1px solid var(--presentation-border);
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  background-color: var(--presentation-background);

  &:hover {
    border-color: var(--presentation-primary);
    background-color: var(--presentation-secondary);
  }

  &.active {
    border-color: var(--presentation-primary);
    background-color: var(--presentation-primary);
    color: white;
  }
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.slider {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: var(--presentation-border);
  outline: none;
  -webkit-appearance: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--presentation-primary);
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--presentation-primary);
    cursor: pointer;
    border: none;
  }
}

.slider-value {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--presentation-foreground);
  min-width: 2rem;
  text-align: right;
}

.textarea {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--presentation-border);
  border-radius: 4px;
  font-size: 0.8125rem;
  font-family: inherit;
  color: var(--presentation-foreground);
  background-color: var(--presentation-background);
  resize: vertical;
  min-height: 60px;

  &:focus {
    outline: none;
    border-color: var(--presentation-primary);
  }

  &::placeholder {
    color: var(--presentation-muted-foreground);
  }
}
</style>
