<template>
  <Drawer :open="visible" :direction="placement" @update:open="(value) => emit('update:visible', value)">
    <DrawerContent :class="cn(placement === 'bottom' && 'drawer-full-width')" :style="drawerStyle">
      <DrawerHeader class="tw-flex tw-flex-row tw-items-center tw-justify-between tw-border-b tw-p-4">
        <DrawerTitle class="tw-text-lg tw-font-semibold">
          <slot name="title"></slot>
        </DrawerTitle>
        <DrawerClose
          class="tw-cursor-pointer tw-rounded-md tw-p-2 tw-transition-colors hover:tw-bg-gray-100"
          @click="emit('update:visible', false)"
        >
          <IconClose class="tw-h-4 tw-w-4" />
        </DrawerClose>
      </DrawerHeader>
      <div class="tw-flex-1 tw-overflow-auto tw-p-4" :style="contentStyle">
        <slot></slot>
      </div>
    </DrawerContent>
  </Drawer>
</template>

<script lang="ts" setup>
import { computed, type CSSProperties } from 'vue';
import { cn } from '@/lib/utils';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { icons } from '@/plugins/icon';

const { IconClose } = icons;

const props = withDefaults(
  defineProps<{
    visible: boolean;
    width?: number;
    height?: number;
    contentStyle?: CSSProperties;
    placement?: 'left' | 'right' | 'top' | 'bottom';
  }>(),
  {
    width: 320,
    placement: 'right',
  }
);

const emit = defineEmits<{
  (event: 'update:visible', payload: boolean): void;
}>();

const drawerStyle = computed(() => {
  const style: Record<string, string> = {};

  if (props.width) {
    style.width = `${props.width}px`;
  }

  if (props.height) {
    style.height = `${props.height}px`;
  }

  return style;
});

const contentStyle = computed(() => {
  return {
    ...(props.contentStyle || {}),
  };
});
</script>

<style>
.drawer-full-width {
  width: 100vw !important;
  max-width: none !important;
  left: 0 !important;
  right: 0 !important;
}
</style>
