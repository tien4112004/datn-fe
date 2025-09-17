<template>
  <div :class="computedClass" @click="emit('click')">
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
import { cn } from '@/lib/utils';
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    center?: boolean;
    class?: string;
  }>(),
  {
    center: false,
    class: '',
  }
);

const emit = defineEmits<{
  (event: 'click'): void;
}>();

const computedClass = computed(() =>
  cn(
    'tw-min-w-[80px] tw-cursor-pointer tw-rounded tw-px-2.5 tw-py-1.5 [&+&]:tw-mt-0.5 hover:tw-text-accent tw-flex tw-items-center tw-gap-2',
    props.center ? 'tw-text-center' : 'tw-text-left',
    props.class
  )
);
</script>
