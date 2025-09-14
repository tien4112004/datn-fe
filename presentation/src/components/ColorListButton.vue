<template>
  <Button variant="outline" class="tw-flex tw-w-full tw-items-center tw-justify-center tw-gap-0.5 tw-p-0">
    <div class="tw-border-muted-foreground/20 tw-ml-2 tw-flex tw-flex-1 tw-border tw-border-dashed">
      <div
        v-for="(color, index) in limitedColors"
        :key="index"
        class="tw-ml-0.5 tw-h-5 tw-flex-1 first:tw-ml-0"
      >
        <div class="tw-h-full tw-w-full" :style="{ backgroundColor: color }"></div>
      </div>
    </div>
    <div class="tw-flex tw-w-8 tw-items-center tw-justify-center">
      <IconPalette class="tw-h-3.5 tw-w-3.5" />
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
