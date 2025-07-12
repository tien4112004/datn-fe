<template>
  <div
    class="number-input"
    :class="{
      disabled: disabled,
      focused: focused,
    }"
  >
    <span class="prefix" v-if="$slots.prefix">
      <slot name="prefix"></slot>
    </span>
    <div class="input-container">
      <input
        type="text"
        :disabled="disabled"
        v-model="number"
        :placeholder="placeholder"
        @input="($event) => emit('input', $event)"
        @focus="($event) => handleFocus($event)"
        @blur="($event) => handleBlur($event)"
        @change="($event) => emit('change', $event)"
        @keydown.enter="($event) => handleEnter($event)"
      />
      <div class="handlers">
        <button
          class="handler handler-up"
          :disabled="disabled || number >= max"
          @click="increment"
          type="button"
        >
          <svg fill="currentColor" width="8" height="8" viewBox="64 64 896 896">
            <path
              d="M890.5 755.3L537.9 269.2c-12.8-17.6-39-17.6-51.7 0L133.5 755.3A8 8 0 00140 768h75c5.1 0 9.9-2.5 12.9-6.6L512 369.8l284.1 391.6c3 4.1 7.8 6.6 12.9 6.6h75c6.5 0 10.3-7.4 6.5-12.7z"
            ></path>
          </svg>
        </button>
        <button
          class="handler handler-down"
          :disabled="disabled || number <= min"
          @click="decrement"
          type="button"
        >
          <svg fill="currentColor" width="8" height="8" viewBox="64 64 896 896">
            <path
              d="M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2 227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3 7.4-6.5 12.7l352.6 486.1c12.8 17.6 39 17.6 51.7 0l352.6-486.1c3.9-5.3.1-12.7-6.4-12.7z"
            ></path>
          </svg>
        </button>
      </div>
    </div>
    <span class="suffix" v-if="$slots.suffix">
      <slot name="suffix"></slot>
    </span>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';

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

<style lang="scss" scoped>
.number-input {
  background-color: $background;
  border: 1px solid #d9d9d9;
  border-radius: $borderRadius;
  transition: border-color 0.25s;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  min-height: 32px;

  .input-container {
    flex: 1;
    display: flex;
    align-items: center;
    position: relative;

    input {
      width: 100%;
      min-width: 0;
      padding: 6px 8px;
      padding-right: 28px; // Make space for handlers
      height: 100%;
      line-height: 1.5;
      outline: 0;
      border: 0;
      background: transparent;
      color: $textColor;

      &::placeholder {
        color: $muted-foreground;
      }

      &:disabled {
        color: #b7b7b7;
        cursor: not-allowed;
      }
    }

    .handlers {
      position: absolute;
      right: 4px;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      flex-direction: column;
      gap: 1px;
      opacity: 0;
      transition: opacity 0.25s;

      .handler {
        width: 20px;
        height: 12px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        background: transparent;
        border: none;
        border-radius: 2px;
        color: $gray-999;
        transition: all 0.25s;
        padding: 0;

        &:hover:not(:disabled) {
          color: $themeColor;
          background-color: rgba(0, 0, 0, 0.04);
        }

        &:active:not(:disabled) {
          background-color: rgba(0, 0, 0, 0.08);
        }

        &:disabled {
          color: #d9d9d9;
          cursor: not-allowed;
        }

        svg {
          pointer-events: none;
        }
      }
    }
  }

  &:not(.disabled):hover .handlers {
    opacity: 1;
  }

  &:not(.disabled):hover,
  &.focused {
    border-color: $themeColor;
  }

  &.disabled {
    background-color: $gray-f5f5f5;
    color: #b7b7b7;
    cursor: not-allowed;

    .handlers {
      display: none;
    }
  }

  .prefix,
  .suffix {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 8px;
    line-height: 1.5;
    user-select: none;
    color: $gray-999;
  }

  .prefix {
    border-right: 1px solid #d9d9d9;
  }

  .suffix {
    border-left: 1px solid #d9d9d9;
  }
}
</style>
