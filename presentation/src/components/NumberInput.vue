<template>
  <div
    :class="[
      'tw-group tw-relative tw-inline-flex tw-min-h-9 tw-items-center tw-rounded-md tw-border tw-border-gray-300 tw-bg-white tw-transition-all tw-duration-200',
      disabled ? 'tw-cursor-not-allowed tw-bg-gray-50 tw-text-gray-500' : 'hover:tw-border-blue-500',
      focused ? 'tw-border-blue-500 tw-ring-[3px] tw-ring-blue-500/50' : '',
    ]"
  >
    <span
      v-if="$slots.prefix"
      class="tw-flex tw-select-none tw-items-center tw-justify-center tw-border-r tw-border-gray-300 tw-px-3 tw-text-gray-600"
    >
      <slot name="prefix"></slot>
    </span>

    <div class="tw-relative tw-flex tw-flex-1 tw-items-center">
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
          'tw-border-0 tw-bg-transparent tw-shadow-none focus-visible:tw-border-transparent focus-visible:tw-ring-0',
          $slots.suffix ? 'tw-pr-16' : 'tw-pr-12',
        ]"
      />

      <div
        :class="[
          'tw-absolute tw-right-1 tw-top-1/2 tw-flex tw--translate-y-1/2 tw-transform tw-flex-col tw-gap-px tw-transition-opacity tw-duration-200',
          disabled ? 'tw-hidden' : 'tw-opacity-0 group-hover:tw-opacity-100',
        ]"
      >
        <button
          type="button"
          :disabled="disabled || number >= max"
          @click="increment"
          class="tw-flex tw-h-4 tw-w-5 tw-cursor-pointer tw-items-center tw-justify-center tw-rounded-sm tw-border-0 tw-bg-transparent tw-p-0 tw-text-gray-600 tw-transition-all tw-duration-200 hover:tw-bg-black/5 hover:tw-text-blue-500 active:tw-bg-black/10 disabled:tw-cursor-not-allowed disabled:tw-text-gray-300"
        >
          <svg
            fill="currentColor"
            width="8"
            height="8"
            viewBox="64 64 896 896"
            class="tw-pointer-events-none"
          >
            <path
              d="M890.5 755.3L537.9 269.2c-12.8-17.6-39-17.6-51.7 0L133.5 755.3A8 8 0 00140 768h75c5.1 0 9.9-2.5 12.9-6.6L512 369.8l284.1 391.6c3 4.1 7.8 6.6 12.9 6.6h75c6.5 0 10.3-7.4 6.5-12.7z"
            ></path>
          </svg>
        </button>

        <button
          type="button"
          :disabled="disabled || number <= min"
          @click="decrement"
          class="tw-flex tw-h-4 tw-w-5 tw-cursor-pointer tw-items-center tw-justify-center tw-rounded-sm tw-border-0 tw-bg-transparent tw-p-0 tw-text-gray-600 tw-transition-all tw-duration-200 hover:tw-bg-black/5 hover:tw-text-blue-500 active:tw-bg-black/10 disabled:tw-cursor-not-allowed disabled:tw-text-gray-300"
        >
          <svg
            fill="currentColor"
            width="8"
            height="8"
            viewBox="64 64 896 896"
            class="tw-pointer-events-none"
          >
            <path
              d="M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2 227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3 7.4-6.5 12.7l352.6 486.1c12.8 17.6 39 17.6 51.7 0l352.6-486.1c3.9-5.3.1-12.7-6.4-12.7z"
            ></path>
          </svg>
        </button>
      </div>
    </div>

    <span
      v-if="$slots.suffix"
      class="tw-flex tw-select-none tw-items-center tw-justify-center tw-border-l tw-border-gray-300 tw-px-3 tw-text-gray-600"
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
