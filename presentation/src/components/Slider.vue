<template>
  <Slider
    :model-value="sliderValue"
    @update:model-value="handleValueChange"
    :disabled="disabled"
    :min="min"
    :max="max"
    :step="step"
  />
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { Slider } from './ui/slider';

const props = withDefaults(
  defineProps<{
    value: number | [number, number];
    disabled?: boolean;
    min?: number;
    max?: number;
    step?: number;
    range?: boolean;
  }>(),
  {
    disabled: false,
    min: 0,
    max: 100,
    step: 1,
    range: false,
  }
);

const emit = defineEmits<{
  'update:value': [payload: number | [number, number]];
}>();

// Convert value to array format that Shadcn slider expects
const sliderValue = computed(() => {
  if (props.range) {
    // For range mode, ensure we have an array
    if (Array.isArray(props.value)) {
      return props.value;
    }
    // If single value provided for range, create a range
    return [props.min, props.value];
  } else {
    // For single mode, convert to array format
    if (Array.isArray(props.value)) {
      return [props.value[0]];
    }
    return [props.value];
  }
});

const handleValueChange = (newValue: number[] | undefined) => {
  if (!newValue || newValue.length === 0) return;

  if (props.range) {
    // For range mode, emit array with two values
    emit('update:value', [newValue[0], newValue[1] || newValue[0]]);
  } else {
    // For single mode, emit single number
    emit('update:value', newValue[0]);
  }
};
</script>
