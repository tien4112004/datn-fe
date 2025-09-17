<template>
  <ShadcnButton :variant="variant" :size="buttonSize" :disabled="disabled" @click="handleClick()">
    <slot></slot>
  </ShadcnButton>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { Button as ShadcnButton } from '@/components/ui/button';

const props = withDefaults(
  defineProps<{
    checked?: boolean;
    disabled?: boolean;
    type?: 'default' | 'primary' | 'checkbox' | 'radio';
    size?: 'small' | 'normal';
  }>(),
  {
    checked: false,
    disabled: false,
    type: 'default',
    size: 'normal',
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

const handleClick = () => {
  if (props.disabled) return;
  emit('click');
};
</script>
