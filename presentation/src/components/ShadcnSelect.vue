<template>
  <div>
    <Select
      :model-value="value"
      @update:model-value="handleValueUpdate"
      :disabled="disabled"
      :open="open"
      @update:open="handleOpenUpdate"
    >
      <SelectTrigger
        :class="[
          'bg-background border-border h-8 w-full select-none rounded border pr-8 transition-colors duration-200',
          'hover:border-primary focus:border-primary focus:outline-none',
          disabled ? 'cursor-default border-gray-300 bg-gray-50 text-gray-400' : 'cursor-pointer',
          hasCustomIcon ? 'has-custom-icon' : '',
        ]"
      >
        <SelectValue :placeholder="placeholder">
          <template v-if="showLabel">{{ showLabel }}</template>
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
      <SelectContent class="max-h-64 select-none">
        <template v-if="search">
          <div class="mb-1.5 border-b border-gray-200 p-1.5">
            <Input
              ref="searchInputRef"
              simple
              :placeholder="searchPlaceholder"
              v-model:value="searchKey"
              class="w-full"
            />
          </div>
        </template>
        <template v-for="option in showOptions" :key="option.value">
          <SelectItem
            :value="option.value"
            :disabled="option.disabled"
            :class="[
              'focus:text-primary h-8 truncate rounded border-none px-1.5 leading-8 focus:font-bold focus:outline-none',
              option.disabled ? 'text-gray-400' : 'hover:bg-primary/5 focus:bg-primary/5 cursor-pointer',
              option.value === value ? 'text-primary focus:text-accent font-bold' : '',
            ]"
          >
            {{ option.label }}
          </SelectItem>
        </template>
      </SelectContent>
    </Select>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch, nextTick, onBeforeUnmount, useSlots } from 'vue';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Input from './Input.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

const props = withDefaults(
  defineProps<{
    value: string | number;
    options: SelectOption[];
    disabled?: boolean;
    search?: boolean;
    searchLabel?: string;
    placeholder?: string;
  }>(),
  {
    disabled: false,
    search: false,
    searchLabel: '',
    placeholder: '',
  }
);

const emit = defineEmits<{
  (event: 'update:value', payload: string | number): void;
}>();

const open = ref(false);
const searchInputRef = ref<InstanceType<typeof Input>>();
const searchKey = ref('');

// Check if custom icon slot is being used
const slots = useSlots();
const hasCustomIcon = computed(() => !!slots.icon);

const showLabel = computed(() => {
  return props.options.find((item) => item.value === props.value)?.label || props.value;
});

const searchPlaceholder = computed(() => {
  return props.searchLabel || t('ui.components.select.search');
});

const showOptions = computed(() => {
  if (!props.search) return props.options;
  if (!searchKey.value.trim()) return props.options;
  const opts = props.options.filter((item) => {
    return item.label.toLowerCase().indexOf(searchKey.value.toLowerCase()) !== -1;
  });
  return opts.length ? opts : props.options;
});

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
    emit('update:value', value);
  }
};

const handleOpenUpdate = (isOpen: boolean) => {
  open.value = isOpen;
  if (isOpen) {
    nextTick(() => {
      if (searchInputRef.value) searchInputRef.value.focus();
    });
  } else {
    searchKey.value = '';
  }
};

onBeforeUnmount(() => {
  searchKey.value = '';
});
</script>

<style lang="scss" scoped>
:deep(.has-custom-icon [data-slot='select-icon']) {
  display: none;
}

:deep([data-slot='select-value']) {
  min-width: 50px;
  height: 30px;
  line-height: 30px;
  padding-left: 10px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  justify-content: flex-start;
}
</style>
