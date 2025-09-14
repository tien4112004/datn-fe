<template>
  <Textarea
    ref="textareaRef"
    v-model="modelValue"
    :class="[
      'duration-250 tw-box-border tw-w-full tw-resize-none tw-rounded-md tw-border tw-border-gray-300 tw-leading-relaxed tw-outline-none transition-colors',
      'tw-text-base font-sans',
      'focus:tw-shadow-none focus:tw-outline-none focus:border-blue-500',
      'disabled:tw-bg-gray-100 disabled:tw-text-gray-500 disabled:border-gray-300',
      'placeholder:text-gray-500',
      { 'resize-y': resizable },
    ]"
    :disabled="disabled"
    :rows="rows"
    :placeholder="placeholder"
    :style="{
      padding: padding ? `${padding}px` : '10px',
    }"
    @focus="($event: FocusEvent) => emit('focus', $event)"
    @blur="($event: FocusEvent) => emit('blur', $event)"
    @keydown.enter="($event: KeyboardEvent) => emit('enter', $event)"
  />
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { Textarea } from '@/components/ui/textarea';

const props = withDefaults(
  defineProps<{
    value: string;
    rows?: number;
    padding?: number;
    disabled?: boolean;
    resizable?: boolean;
    placeholder?: string;
  }>(),
  {
    rows: 4,
    disabled: false,
    resizable: false,
    placeholder: '',
  }
);

const emit = defineEmits<{
  (event: 'update:value', payload: string): void;
  (event: 'focus', payload: FocusEvent): void;
  (event: 'blur', payload: FocusEvent): void;
  (event: 'enter', payload: KeyboardEvent): void;
}>();

// Create computed property to bridge v-model:value to v-model
const modelValue = computed({
  get: () => props.value,
  set: (newValue: string) => emit('update:value', newValue),
});

const textareaRef = ref();
const focus = () => {
  if (textareaRef.value?.$el) {
    textareaRef.value.$el.focus();
  }
};

defineExpose({
  focus,
});
</script>
