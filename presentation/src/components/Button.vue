<template>
  <ShadcnButton
    :variant="variant"
    :size="buttonSize"
    :disabled="disabled"
    :class="additionalClasses"
    @click="handleClick()"
  >
    <slot></slot>
  </ShadcnButton>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { Button as ShadcnButton } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const props = withDefaults(
  defineProps<{
    checked?: boolean;
    disabled?: boolean;
    type?: 'default' | 'primary' | 'checkbox' | 'radio';
    size?: 'small' | 'normal';
    first?: boolean;
    last?: boolean;
  }>(),
  {
    checked: false,
    disabled: false,
    type: 'default',
    size: 'normal',
    first: false,
    last: false,
  }
);

const emit = defineEmits<{
  (event: 'click'): void;
}>();

// Map legacy props to Shadcn Button props
const variant = computed(() => {
  if (props.type === 'primary') return 'default';
  if (props.type === 'default') return 'outline';
  return 'outline';
});

const buttonSize = computed(() => {
  if (props.size === 'small') return 'sm';
  return 'default';
});

// Additional classes to maintain first/last border radius behavior
const additionalClasses = computed(() => {
  return cn({
    'rounded-l-none': props.first && !props.last,
    'rounded-r-none': props.last && !props.first,
    'rounded-none': props.first && props.last,
  });
});

const handleClick = () => {
  if (props.disabled) return;
  emit('click');
};
</script>

<style lang="scss" scoped>
.button {
  height: 100%;
  min-height: 32px;
  //   line-height: 32px;
  font-size: 13px;
  padding: 4px 15px;
  text-align: center;
  color: $textColor;
  border-radius: $borderRadius;
  user-select: none;
  //   letter-spacing: 1px;
  cursor: pointer;
  gap: 0px !important;

  &.small {
    height: 24px;
    line-height: 24px;
    padding: 0 7px;
    // letter-spacing: 0;
    font-size: $smTextSize;
  }

  &.default {
    background-color: $background;
    border: 1px solid #d9d9d9;
    color: $textColor;

    &:hover {
      color: $themeColor;
      border-color: $themeColor;
    }
  }
  &.primary {
    background-color: $themeColor;
    border: 1px solid $themeColor;
    color: $background;

    &:hover {
      background-color: $themeHoverColor;
      border-color: $themeHoverColor;
    }
  }
  &.checkbox,
  &.radio {
    background-color: $background;
    border: 1px solid #d9d9d9;
    color: $textColor;

    &:not(.checked):hover {
      color: $themeColor;
    }
  }
  &.checked {
    color: $background;
    background-color: $themeColor;
    border-color: $themeColor;

    &:hover {
      background-color: $themeHoverColor;
      border-color: $themeHoverColor;
    }
  }
  &.disabled {
    background-color: $gray-f5f5f5;
    border: 1px solid #d9d9d9;
    color: #b7b7b7;
    cursor: default;
  }
}
</style>
