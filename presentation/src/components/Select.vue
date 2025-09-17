<template>
  <div v-if="disabled">
    <div
      ref="selectRef"
      class="tw-border-border tw-flex tw-h-8 tw-w-full tw-cursor-pointer tw-select-none tw-items-center tw-bg-gray-50 tw-text-sm tw-text-gray-500 tw-transition-colors tw-duration-200"
    >
      <div class="tw-flex-1 tw-truncate tw-pl-2.5">{{ value }}</div>
      <div class="tw-flex tw-w-8 tw-items-center tw-justify-center tw-text-gray-400">
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
        class="tw-max-h-[260px] tw-select-none tw-overflow-auto tw-p-1.5 tw-text-left tw-text-sm"
        :style="{ width: width + 2 + 'px' }"
      >
        <div
          v-for="option in showOptions"
          :key="option.value"
          :class="{
            'tw-text-gray-500': option.disabled,
            'tw-text-blue-600 font-bold': option.value === value && !option.disabled,
            'hover:tw-bg-blue-50 cursor-pointer': !option.disabled && option.value !== value,
          }"
          class="tw-h-8 tw-truncate tw-rounded-md tw-px-1.5 tw-leading-8"
          @click="handleSelect(option)"
        >
          {{ option.label }}
        </div>
      </div>
    </template>
    <div
      ref="selectRef"
      class="tw-flex tw-h-8 tw-w-full tw-cursor-pointer tw-select-none tw-items-center tw-rounded-md tw-border tw-border-gray-300 tw-bg-white tw-text-sm tw-transition-colors tw-duration-200 hover:tw-border-blue-500"
    >
      <div class="tw-flex-1 tw-truncate tw-pl-2.5">{{ showLabel }}</div>
      <div class="tw-flex tw-w-8 tw-items-center tw-justify-center tw-text-gray-400">
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
