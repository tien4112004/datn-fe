<template>
  <div
    class="min-w-[80px] cursor-pointer rounded px-2.5 py-1.5 text-sm hover:bg-gray-100 [&+&]:mt-0.5"
    :class="center ? 'text-center' : ''"
    @click="emit('click')"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    center?: boolean;
  }>(),
  {
    center: false,
  }
);

const emit = defineEmits<{
  (event: 'click'): void;
}>();
</script>
