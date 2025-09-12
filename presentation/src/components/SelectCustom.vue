<template>
  <div v-if="disabled">
    <div
      ref="selectRef"
      class="relative h-8 w-full cursor-default select-none border border-gray-300 bg-gray-50 pr-8 text-sm text-gray-500 transition-colors duration-200"
    >
      <div class="h-[30px] min-w-[50px] truncate pl-2.5 leading-[30px]">
        <slot name="label"></slot>
      </div>
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
    v-else
  >
    <template #content>
      <div
        class="max-h-[260px] select-none overflow-auto p-1.5 text-left text-sm"
        :style="{ width: width + 2 + 'px' }"
        @click="popoverVisible = false"
      >
        <slot name="options"></slot>
      </div>
    </template>
    <div
      ref="selectRef"
      class="relative h-8 w-full cursor-pointer select-none rounded-md border border-gray-300 bg-white pr-8 text-sm transition-colors duration-200 hover:border-blue-500"
    >
      <div class="h-[30px] min-w-[50px] truncate pl-2.5 leading-[30px]">
        <slot name="label"></slot>
      </div>
      <div class="absolute right-0 top-0 flex h-[30px] w-8 items-center justify-center text-gray-400">
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
