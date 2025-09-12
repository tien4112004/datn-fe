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
    'min-w-[80px] cursor-pointer rounded px-2.5 py-1.5 [&+&]:mt-0.5',
    props.center ? 'text-center' : 'text-left',
    props.class
  )
);
</script>
