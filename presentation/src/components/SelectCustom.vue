<template>
  <div v-if="disabled">
    <div
      ref="selectRef"
      class="tw-relative tw-h-8 tw-w-full tw-cursor-default tw-select-none tw-border tw-border-gray-300 tw-bg-gray-50 tw-pr-8 tw-text-sm tw-text-gray-500 tw-transition-colors tw-duration-200"
    >
      <div class="tw-h-[30px] tw-min-w-[50px] tw-truncate tw-pl-2.5 tw-leading-[30px]">
        <slot name="label"></slot>
      </div>
      <div
        class="tw-absolute tw-right-0 tw-top-0 tw-flex tw-h-[30px] tw-w-8 tw-items-center tw-justify-center tw-text-gray-400"
      >
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
    v-else
  >
    <template #content>
      <div
        class="tw-max-h-[260px] tw-select-none tw-overflow-auto tw-p-1.5 tw-text-left tw-text-sm"
        :style="{ width: width + 2 + 'px' }"
        @click="popoverVisible = false"
      >
        <slot name="options"></slot>
      </div>
    </template>
    <div
      ref="selectRef"
      class="tw-relative tw-h-8 tw-w-full tw-cursor-pointer tw-select-none tw-rounded-md tw-border tw-border-gray-300 tw-bg-white tw-pr-8 tw-text-sm tw-transition-colors tw-duration-200 hover:tw-border-blue-500"
    >
      <div class="tw-h-[30px] tw-min-w-[50px] tw-truncate tw-pl-2.5 tw-leading-[30px]">
        <slot name="label"></slot>
      </div>
      <div
        class="tw-absolute tw-right-0 tw-top-0 tw-flex tw-h-[30px] tw-w-8 tw-items-center tw-justify-center tw-text-gray-400"
      >
        <slot name="icon">
          <IconDown :size="14" />
        </slot>
      </div>
    </div>
  </Popover>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';
import Popover from './Popover.vue';

withDefaults(
  defineProps<{
    disabled?: boolean;
  }>(),
  {
    disabled: false,
  }
);

const popoverVisible = ref(false);
const selectRef = ref<HTMLElement>();
const width = ref(0);

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
</script>
