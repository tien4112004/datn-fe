<template>
  <div v-if="disabled">
    <div
      ref="selectRef"
      class="relative h-8 w-full cursor-default select-none border border-gray-300 bg-gray-50 pr-8 text-sm text-gray-500 transition-colors duration-200"
    >
      <div class="h-[30px] min-w-[50px] truncate pl-2.5 leading-[30px]">{{ value }}</div>
      <div class="absolute right-0 top-0 flex h-[30px] w-8 items-center justify-center text-gray-400">
        <slot name="icon">
          <IconDown :size="14" />
        </slot>
      </div>
    </div>
  </div>
  <Popover
    trigger="click"
    v-model:value="popoverVisible"
    placement="bottom"
    :contentStyle="{
      padding: 0,
      boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08)',
    }"
    :style="style"
    v-else
  >
    <template #content>
      <template v-if="search">
        <Input
          ref="searchInputRef"
          simple
          :placeholder="searchPlaceholder"
          v-model:value="searchKey"
          :style="{ width: width + 2 + 'px' }"
        />
        <Divider :margin="0" />
      </template>
      <div
        class="max-h-[260px] select-none overflow-auto p-1.5 text-left text-sm"
        :style="{ width: width + 2 + 'px' }"
      >
        <div
          v-for="option in showOptions"
          :key="option.value"
          :class="{
            'text-gray-500': option.disabled,
            'font-bold text-blue-600': option.value === value && !option.disabled,
            'cursor-pointer hover:bg-blue-50': !option.disabled && option.value !== value,
          }"
          class="h-8 truncate rounded-md px-1.5 leading-8"
          @click="handleSelect(option)"
        >
          {{ option.label }}
        </div>
      </div>
    </template>
    <div
      ref="selectRef"
      class="relative h-8 w-full cursor-pointer select-none rounded-md border border-gray-300 bg-white pr-8 text-sm transition-colors duration-200 hover:border-blue-500"
    >
      <div class="h-[30px] min-w-[50px] truncate pl-2.5 leading-[30px]">{{ showLabel }}</div>
      <div class="absolute right-0 top-0 flex h-[30px] w-8 items-center justify-center text-gray-400">
        <slot name="icon">
          <IconDown :size="14" />
        </slot>
      </div>
    </div>
  </Popover>
</template>

<script lang="ts" setup>
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
  watch,
  nextTick,
  onBeforeUnmount,
  type CSSProperties,
} from 'vue';
import Divider from './Divider.vue';
import { useI18n } from 'vue-i18n';
import Popover from './Popover.vue';
import Input from './Input.vue';

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
    style?: CSSProperties;
  }>(),
  {
    disabled: false,
    search: false,
    searchLabel: '',
  }
);

const emit = defineEmits<{
  (event: 'update:value', payload: string | number): void;
}>();

const popoverVisible = ref(false);
const selectRef = ref<HTMLElement>();
const searchInputRef = ref<InstanceType<typeof Input>>();
const width = ref(0);
const searchKey = ref('');

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

watch(popoverVisible, () => {
  if (popoverVisible.value) {
    nextTick(() => {
      if (searchInputRef.value) searchInputRef.value.focus();
    });
  } else searchKey.value = '';
});
onBeforeUnmount(() => {
  searchKey.value = '';
});

const updateWidth = () => {
  if (!selectRef.value) return;
  width.value = selectRef.value.clientWidth;
};
const resizeObserver = new ResizeObserver(updateWidth);
onMounted(() => {
  if (!selectRef.value) return;
  resizeObserver.observe(selectRef.value);
});
onUnmounted(() => {
  if (!selectRef.value) return;
  resizeObserver.unobserve(selectRef.value);
});

const handleSelect = (option: SelectOption) => {
  if (option.disabled) return;

  emit('update:value', option.value);
  popoverVisible.value = false;
};
</script>
