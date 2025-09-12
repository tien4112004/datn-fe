<template>
  <div
    :class="[
      'group relative inline-flex min-h-9 items-center rounded-md border border-gray-300 bg-white transition-all duration-200',
      disabled ? 'cursor-not-allowed bg-gray-50 text-gray-500' : 'hover:border-blue-500',
      focused ? 'border-blue-500 ring-[3px] ring-blue-500/50' : '',
    ]"
  >
    <span
      v-if="$slots.prefix"
      class="flex select-none items-center justify-center border-r border-gray-300 px-3 text-gray-600"
    >
      <slot name="prefix"></slot>
    </span>

    <div class="relative flex flex-1 items-center">
      <Input
        type="text"
        :model-value="String(number)"
        @update:model-value="handleInputChange"
        :disabled="disabled"
        :placeholder="placeholder"
        @input="($event: Event) => emit('input', $event)"
        @focus="($event: Event) => handleFocus($event)"
        @blur="($event: Event) => handleBlur($event)"
        @change="($event: Event) => emit('change', $event)"
        @keydown.enter="($event: Event) => handleEnter($event)"
        :class="[
          'border-0 bg-transparent shadow-none focus-visible:border-transparent focus-visible:ring-0',
          $slots.suffix ? 'pr-16' : 'pr-12',
        ]"
      />

      <div
        :class="[
          'absolute right-1 top-1/2 flex -translate-y-1/2 transform flex-col gap-px transition-opacity duration-200',
          disabled ? 'hidden' : 'opacity-0 group-hover:opacity-100',
        ]"
      >
        <button
          type="button"
          :disabled="disabled || number >= max"
          @click="increment"
          class="flex h-4 w-5 cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent p-0 text-gray-600 transition-all duration-200 hover:bg-black/5 hover:text-blue-500 active:bg-black/10 disabled:cursor-not-allowed disabled:text-gray-300"
        >
          <svg fill="currentColor" width="8" height="8" viewBox="64 64 896 896" class="pointer-events-none">
            <path
              d="M890.5 755.3L537.9 269.2c-12.8-17.6-39-17.6-51.7 0L133.5 755.3A8 8 0 00140 768h75c5.1 0 9.9-2.5 12.9-6.6L512 369.8l284.1 391.6c3 4.1 7.8 6.6 12.9 6.6h75c6.5 0 10.3-7.4 6.5-12.7z"
            ></path>
          </svg>
        </button>

        <button
          type="button"
          :disabled="disabled || number <= min"
          @click="decrement"
          class="flex h-4 w-5 cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent p-0 text-gray-600 transition-all duration-200 hover:bg-black/5 hover:text-blue-500 active:bg-black/10 disabled:cursor-not-allowed disabled:text-gray-300"
        >
          <svg fill="currentColor" width="8" height="8" viewBox="64 64 896 896" class="pointer-events-none">
            <path
              d="M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2 227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3 7.4-6.5 12.7l352.6 486.1c12.8 17.6 39 17.6 51.7 0l352.6-486.1c3.9-5.3.1-12.7-6.4-12.7z"
            ></path>
          </svg>
        </button>
      </div>
    </div>

    <span
      v-if="$slots.suffix"
      class="flex select-none items-center justify-center border-l border-gray-300 px-3 text-gray-600"
    >
      <slot name="suffix"></slot>
    </span>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { Input } from './ui/input';
import type { Event } from 'clipboard';

const props = withDefaults(
  defineProps<{
    value: number;
    disabled?: boolean;
    placeholder?: string;
    min?: number;
    max?: number;
    step?: number;
  }>(),
  {
    disabled: false,
    placeholder: '',
    min: 0,
    max: Infinity,
    step: 1,
  }
);

const emit = defineEmits<{
  (event: 'update:value', payload: number): void;
  (event: 'input', payload: Event): void;
  (event: 'change', payload: Event): void;
  (event: 'blur', payload: Event): void;
  (event: 'focus', payload: Event): void;
  (event: 'enter', payload: Event): void;
}>();

const number = ref(0);
const focused = ref(false);

watch(
  () => props.value,
  () => {
    if (props.value !== number.value) {
      number.value = props.value;
    }
  },
  {
    immediate: true,
  }
);

watch(number, () => {
  const value = +number.value;
  if (isNaN(value)) return;
  else if (value > props.max) return;
  else if (value < props.min) return;

  number.value = value;
  emit('update:value', number.value);
});

const handleInputChange = (value: string | number) => {
  number.value = +value;
};

const checkAndEmitValue = () => {
  let value = +number.value;
  if (isNaN(value)) value = props.min;
  else if (value > props.max) value = props.max;
  else if (value < props.min) value = props.min;

  number.value = value;
  emit('update:value', number.value);
};

const handleEnter = (e: Event) => {
  checkAndEmitValue();
  emit('enter', e);
};

const handleBlur = (e: Event) => {
  checkAndEmitValue();
  focused.value = false;
  emit('blur', e);
};
const handleFocus = (e: Event) => {
  focused.value = true;
  emit('focus', e);
};

const increment = () => {
  if (props.disabled || number.value >= props.max) return;
  number.value = Math.min(props.max, number.value + props.step);
};

const decrement = () => {
  if (props.disabled || number.value <= props.min) return;
  number.value = Math.max(props.min, number.value - props.step);
};
</script>
