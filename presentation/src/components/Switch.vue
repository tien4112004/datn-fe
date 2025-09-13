<template>
  <Switch :checked="value" :disabled="disabled" @click="handleChange" :size="size" />
</template>

<script lang="ts" setup>
import Switch from './ui/switch/Switch.vue';

const props = withDefaults(
  defineProps<{
    value: boolean;
    disabled?: boolean;
    size?: 'small' | 'medium';
  }>(),
  {
    disabled: false,
    size: 'medium',
  }
);

const emit = defineEmits<{
  'update:value': [payload: boolean];
}>();

const handleChange = () => {
  emit('update:value', !props.value);
};
</script>
