<template>
  <ToggleGroup
    :type="type"
    :modelValue="modelValue"
    @update="handleUpdate"
    :variant="variant"
    :size="size"
    :class="className"
    :disabled="disabled"
  >
    <slot></slot>
  </ToggleGroup>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { ToggleGroup } from '@/components/ui/toggle-group';

type ToggleType = 'single' | 'multiple' | undefined;
type VariantType = 'default' | 'outline';
type SizeType = 'default' | 'sm' | 'lg';

const props = withDefaults(
  defineProps<{
    // ToggleGroup props
    type?: ToggleType;
    modelValue?: string | string[];
    variant?: VariantType;
    size?: SizeType;
    disabled?: boolean;

    // Legacy ButtonGroup props
    passive?: boolean;
    class?: string;
  }>(),
  {
    type: undefined,
    passive: false,
    variant: 'outline',
    size: 'default',
    disabled: false,
    class: '',
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: string | string[] | undefined];
}>();

const className = computed(() => props.class);

const handleUpdate = (value: string | string[] | undefined) => {
  emit('update:modelValue', value);
};
</script>
