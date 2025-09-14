<template>
  <div
    :class="[
      'tw-bg-background tw-duration-250 tw-flex tw-min-h-[30px] tw-items-center tw-rounded tw-border tw-border-gray-300 tw-px-[5px] tw-transition-colors',
      {
        'tw-border-gray-200 tw-bg-gray-100 tw-text-gray-400': disabled,
        'tw-border-blue-500': focused || (hovering && !disabled),
        'tw-border-0': simple,
      },
    ]"
    @mouseenter="!disabled && (hovering = true)"
    @mouseleave="hovering = false"
  >
    <span
      v-if="$slots.prefix"
      class="tw-flex tw-select-none tw-items-center tw-justify-center tw-leading-[30px]"
    >
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
        'tw-h-[30px] tw-min-w-0 tw-flex-1 tw-border-0 tw-bg-transparent tw-px-0 tw-leading-[30px] tw-shadow-none focus-visible:tw-border-0 focus-visible:tw-ring-0',
        { 'tw-text-gray-400': disabled },
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
    <span
      v-if="$slots.suffix"
      class="tw-flex tw-select-none tw-items-center tw-justify-center tw-leading-[30px]"
    >
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
