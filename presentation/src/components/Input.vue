<template>
  <div
    :class="[
      'bg-background duration-250 flex min-h-[30px] items-center rounded border border-gray-300 px-[5px] transition-colors',
      {
        'border-gray-200 bg-gray-100 text-gray-400': disabled,
        'border-blue-500': focused || (hovering && !disabled),
        'border-0': simple,
      },
    ]"
    @mouseenter="!disabled && (hovering = true)"
    @mouseleave="hovering = false"
  >
    <span v-if="$slots.prefix" class="flex select-none items-center justify-center leading-[30px]">
      <slot name="prefix"></slot>
    </span>
    <Input
      ref="inputRef"
      :model-value="value"
      type="text"
      :disabled="disabled"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :class="[
        'h-[30px] min-w-0 flex-1 border-0 bg-transparent px-0 leading-[30px] shadow-none focus-visible:border-0 focus-visible:ring-0',
        {
          'text-gray-400': disabled,
        },
      ]"
      style="
        font-family:
          -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans',
          sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
      "
      @update:model-value="(newValue: string | number) => emit('update:value', String(newValue))"
      @focus="($event: Event) => handleFocus($event)"
      @blur="($event: Event) => handleBlur($event)"
      @change="($event: Event) => emit('change', $event)"
      @keydown.enter="($event: Event) => emit('enter', $event)"
      @keydown.backspace="($event: Event) => emit('backspace', $event)"
    />
    <span v-if="$slots.suffix" class="flex select-none items-center justify-center leading-[30px]">
      <slot name="suffix"></slot>
    </span>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { Input } from '@/components/ui/input';

withDefaults(
  defineProps<{
    value: string;
    disabled?: boolean;
    placeholder?: string;
    simple?: boolean;
    maxlength?: number;
  }>(),
  {
    disabled: false,
    placeholder: '',
    simple: false,
  }
);

const emit = defineEmits<{
  (event: 'update:value', payload: string): void;
  (event: 'input', payload: Event): void;
  (event: 'change', payload: Event): void;
  (event: 'blur', payload: Event): void;
  (event: 'focus', payload: Event): void;
  (event: 'enter', payload: Event): void;
  (event: 'backspace', payload: Event): void;
}>();

const focused = ref(false);
const hovering = ref(false);

const handleBlur = (e: Event) => {
  focused.value = false;
  emit('blur', e);
};
const handleFocus = (e: Event) => {
  focused.value = true;
  emit('focus', e);
};

const inputRef = ref();
const focus = () => {
  if (inputRef.value?.$el) {
    inputRef.value.$el.focus();
  } else if (inputRef.value?.focus) {
    inputRef.value.focus();
  }
};

defineExpose({
  focus,
});
</script>
