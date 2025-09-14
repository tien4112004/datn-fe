<template>
  <Popover :open="internalOpen" @update:open="handleOpenChange" :modal="true">
    <PopoverTrigger as-child>
      <div
        ref="triggerRef"
        :class="[center ? 'tw-flex tw-items-center tw-justify-center' : '', props.triggerClass]"
        :style="props.style"
      >
        <slot></slot>
      </div>
    </PopoverTrigger>
    <PopoverContent
      :side="getSide(placement)"
      :align="getAlign(placement)"
      :sideOffset="offset"
      :style="contentStyle"
      :class="[
        'data-[state=open]:animate-in data-[state=closed]:tw-animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 tw-w-fit',
        props.contentClass,
      ]"
    >
      <slot name="content"></slot>
    </PopoverContent>
  </Popover>
</template>

<script lang="ts" setup>
import { type CSSProperties, watch, ref } from 'vue';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import type { Placement } from 'tippy.js';

const props = withDefaults(
  defineProps<{
    value?: boolean;
    placement?: Placement;
    style?: CSSProperties;
    appendTo?: HTMLElement | 'parent';
    contentStyle?: CSSProperties;
    center?: boolean;
    offset?: number;
    triggerClass?: string;
    contentClass?: string;
  }>(),
  {
    value: false,
    placement: 'bottom',
    center: false,
    offset: 8,
    triggerClass: '',
    contentClass: '',
  }
);

const emit = defineEmits<{
  (event: 'update:value', payload: boolean): void;
  (event: 'show'): void;
  (event: 'hide'): void;
}>();

const triggerRef = ref<HTMLElement>();
const internalOpen = ref(props.value);

// Convert tippy.js placement to reka-ui placement
const getSide = (placement: Placement) => {
  if (placement.includes('top')) return 'top';
  if (placement.includes('right')) return 'right';
  if (placement.includes('bottom')) return 'bottom';
  if (placement.includes('left')) return 'left';
  return 'bottom';
};

const getAlign = (placement: Placement) => {
  if (placement.includes('start')) return 'start';
  if (placement.includes('end')) return 'end';
  return 'center';
};

// Handle open state changes
const handleOpenChange = (open: boolean) => {
  internalOpen.value = open;
  emit('update:value', open);

  if (open) {
    emit('show');
  } else {
    emit('hide');
  }
};

// Watch for external changes to value prop
watch(
  () => props.value,
  (newValue) => {
    internalOpen.value = newValue;
  }
);
</script>
