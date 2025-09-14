<template>
  <Button variant="outline" size="default" class="tw-h-auto tw-min-h-9 tw-w-full tw-flex-col tw-p-0">
    <slot></slot>
    <div class="tw-relative tw-mt-[-4px] tw-h-1 tw-w-[17px]">
      <div class="tw-absolute tw-inset-0" :style="{ backgroundColor: color }"></div>
    </div>
  </Button>
</template>

<script lang="ts" setup>
import { Button } from './ui/button';

defineProps<{
  color: string;
}>();
</script>
