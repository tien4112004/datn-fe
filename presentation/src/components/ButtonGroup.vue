<template>
  <ToggleGroup
    :type="type"
    :value="value"
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
import { ToggleGroup } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import { computed } from 'vue';

type ToggleType = 'single' | 'multiple' | undefined;
type VariantType = 'default' | 'outline';
type SizeType = 'default' | 'sm' | 'lg';

const props = withDefaults(
  defineProps<{
    type?: ToggleType;
    value?: string | string[];
    variant?: VariantType;
    size?: SizeType;
    disabled?: boolean;
    class?: string;
  }>(),
  {
    type: undefined,
    variant: 'outline',
    size: 'default',
    disabled: false,
    class: '',
  }
);

const emit = defineEmits<{
  'update:value': [value: string | string[] | undefined];
}>();

const className = computed(() => cn('button-group', props.class));

const handleUpdate = (value: string | string[] | undefined) => {
  emit('update:value', value);
};
</script>

<style scoped>
.button-group > *:first-child,
.button-group > *:first-child > *,
.button-group > *:first-child [data-slot='popover-trigger'],
.button-group > *:first-child [data-slot='popover-trigger'] > * {
  border-radius: var(--presentation-radius) 0 0 var(--presentation-radius) !important;
}

.button-group > *:last-child,
.button-group > *:last-child > *,
.button-group > *:last-child [data-slot='popover-trigger'],
.button-group > *:last-child [data-slot='popover-trigger'] > * {
  border-radius: 0 var(--presentation-radius) var(--presentation-radius) 0 !important;
}

.button-group > *:not(:first-child):not(:last-child),
.button-group > *:not(:first-child):not(:last-child) > *,
.button-group > *:not(:first-child):not(:last-child) [data-slot='popover-trigger'],
.button-group > *:not(:first-child):not(:last-child) [data-slot='popover-trigger'] > * {
  border-radius: 0 !important;
}

/* Special handling for Select components */
.button-group > *:first-child .relative {
  border-radius: var(--presentation-radius) 0 0 var(--presentation-radius) !important;
}

.button-group > *:last-child .relative {
  border-radius: 0 var(--presentation-radius) var(--presentation-radius) 0 !important;
}

.button-group > *:not(:first-child):not(:last-child) .relative {
  border-radius: 0 !important;
}
</style>
