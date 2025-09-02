<template>
  <Textarea
    ref="textareaRef"
    v-model="modelValue"
    :class="[
      'duration-250 box-border w-full resize-none rounded-md border border-gray-300 leading-relaxed outline-none transition-colors',
      'font-sans text-base',
      'focus:border-blue-500 focus:shadow-none focus:outline-none',
      'disabled:border-gray-300 disabled:bg-gray-100 disabled:text-gray-500',
      'placeholder:text-gray-500',
      {
        'resize-y': resizable,
      },
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
