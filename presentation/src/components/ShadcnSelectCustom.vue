<template>
  <Select
    :model-value="modelValue"
    @update:model-value="handleValueUpdate"
    :disabled="disabled"
    :open="open"
    @update:open="handleOpenUpdate"
  >
    <SelectTrigger
      :class="[
        'bg-background border-border h-8 w-full select-none rounded border pr-8 text-[13px] transition-colors duration-200',
        'hover:border-primary focus:border-primary focus:outline-none',
        disabled ? 'cursor-default border-gray-300 bg-gray-50 text-gray-400' : 'cursor-pointer',
        hasCustomIcon ? 'has-custom-icon' : '',
      ]"
    >
      <SelectValue>
        <div class="h-7 min-w-12 truncate pl-2.5 leading-7">
          <slot name="label"></slot>
        </div>
      </SelectValue>
      <div
        v-if="hasCustomIcon"
        class="text-muted-foreground pointer-events-none absolute right-0 top-0 flex h-7 w-8 items-center justify-center"
      >
        <slot name="icon">
          <IconDown :size="14" />
        </slot>
      </div>
    </SelectTrigger>
    <SelectContent @click="handleContentClick">
      <div class="max-h-64 select-none overflow-auto p-1.5 text-left text-[13px]">
        <slot name="options"></slot>
      </div>
    </SelectContent>
  </Select>
</template>

<script lang="ts" setup>
import { ref, computed, useSlots } from 'vue';
import { Select, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select';

const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    modelValue?: string | number | null;
  }>(),
  {
    disabled: false,
    modelValue: undefined,
  }
);

const emit = defineEmits<{
  (event: 'update:modelValue', payload: string | number | null | undefined): void;
}>();

const open = ref(false);

// Check if custom icon slot is being used
const slots = useSlots();
const hasCustomIcon = computed(() => !!slots.icon);

const handleValueUpdate = (newValue: any) => {
  if (newValue !== null && newValue !== undefined) {
    // Convert bigint to string to maintain compatibility, handle any type
    let value = newValue;
    if (typeof newValue === 'bigint') {
      value = newValue.toString();
    } else if (typeof newValue === 'object') {
      // For complex objects, try to extract a value property or convert to string
      value = newValue.value || JSON.stringify(newValue);
    }
    emit('update:modelValue', value);
  } else {
    emit('update:modelValue', undefined);
  }
};

const handleOpenUpdate = (isOpen: boolean) => {
  open.value = isOpen;
};

const handleContentClick = () => {
  // Close dropdown when content is clicked (matches original behavior)
  open.value = false;
};
</script>

<style lang="scss" scoped>
/* Custom styles to override Shadcn defaults and hide default icon when custom icon is present */
:deep(.has-custom-icon [data-slot='select-icon']) {
  display: none;
}

/* Override Shadcn SelectItem default focus/hover styles to remove border */
:deep([data-slot='select-item']) {
  border: none !important;
  outline: none !important;

  &:focus,
  &:hover {
    border: none !important;
    outline: none !important;
    box-shadow: none !important;
  }
}
</style>
