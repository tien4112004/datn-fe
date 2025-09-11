<template>
  <Button variant="outline" class="h-9 w-full justify-center gap-0.5 overflow-hidden p-0">
    <div class="border-border/20 ml-2 h-5 flex-1 border border-dashed">
      <div class="h-full w-full" :style="{ backgroundColor: color }" />
    </div>
    <div class="flex w-8 items-center justify-center">
      <IconPalette class="h-3.5 w-3.5" />
    </div>
  </Button>
</template>

<script lang="ts" setup>
import { Button } from '@/components/ui/button';

defineProps<{
  color: string;
}>();
</script>
