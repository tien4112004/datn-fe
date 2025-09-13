<template>
  <Button variant="outline" class="flex w-full items-center justify-center gap-0.5 p-0">
    <div class="border-muted-foreground/20 ml-2 flex flex-1 border border-dashed">
      <div v-for="(color, index) in limitedColors" :key="index" class="ml-0.5 h-5 flex-1 first:ml-0">
        <div class="h-full w-full" :style="{ backgroundColor: color }"></div>
      </div>
    </div>
    <div class="flex w-8 items-center justify-center">
      <IconPalette class="h-3.5 w-3.5" />
    </div>
  </Button>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { Button } from '@/components/ui/button';

const props = defineProps<{
  colors: string[];
}>();

const limitedColors = computed(() => {
  if (props.colors.length > 12) return props.colors.slice(0, 12);
  return props.colors;
});
</script>
