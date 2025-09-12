<template>
  <Button variant="outline" size="default" class="h-auto min-h-9 w-full flex-col p-0">
    <slot></slot>
    <div class="relative mt-[-4px] h-1 w-[17px]">
      <div class="absolute inset-0" :style="{ backgroundColor: color }"></div>
    </div>
  </Button>
</template>

<script lang="ts" setup>
import { Button } from './ui/button';

defineProps<{
  color: string;
}>();
</script>
