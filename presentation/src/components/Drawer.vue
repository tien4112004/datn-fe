<template>
  <Drawer :open="visible" :direction="placement" @update:open="(value) => emit('update:visible', value)">
    <DrawerContent :class="cn('w-full max-w-none')" :style="drawerStyle">
      <DrawerHeader class="flex flex-row items-center justify-between border-b p-4">
        <DrawerTitle class="text-lg font-semibold">
          <slot name="title"></slot>
        </DrawerTitle>
        <DrawerClose
          class="cursor-pointer rounded-md p-2 transition-colors hover:bg-gray-100"
          @click="emit('update:visible', false)"
        >
          <IconClose class="h-4 w-4" />
        </DrawerClose>
      </DrawerHeader>
      <div class="flex-1 overflow-auto p-4" :style="contentStyle">
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
