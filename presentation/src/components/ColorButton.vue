<template>
  <Button variant="outline" class="tw-h-9 tw-w-full tw-justify-center tw-gap-0.5 tw-overflow-hidden tw-p-0">
    <div class="tw-border-border/20 tw-ml-2 tw-h-5 tw-flex-1 tw-border tw-border-dashed">
      <div class="tw-h-full tw-w-full" :style="{ backgroundColor: color }" />
    </div>
    <div class="tw-flex tw-w-8 tw-items-center tw-justify-center">
      <IconPalette class="tw-h-3.5 tw-w-3.5" />
    </div>
  </Button>
</template>

<script lang="ts" setup>
import { Button } from '@/components/ui/button';

defineProps<{
  color: string;
}>();
</script>
