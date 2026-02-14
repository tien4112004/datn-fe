<template>
  <div class="empty-canvas">
    <div class="empty-content">
      <div class="empty-icon">
        <IconPpt />
      </div>
      <div class="empty-title">{{ $t('emptyState.noSlides.title') }}</div>
      <div class="empty-description">{{ $t('emptyState.noSlides.description') }}</div>
      <Button v-if="mode === 'edit'" type="primary" @click="createSlide">
        {{ $t('emptyState.noSlides.addSlide') }}
      </Button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { useContainerStore } from '@/store';
import useSlideHandler from '@/hooks/useSlideHandler';
import Button from '@/components/ui/button/Button.vue';

const containerStore = useContainerStore();
const { mode } = storeToRefs(containerStore);

const { createSlide } = useSlideHandler();
</script>

<style lang="scss" scoped>
.empty-canvas {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--presentation-background);
  padding: 20px;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  max-width: 400px;
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--presentation-foreground);
  opacity: 0.2;
  font-size: 80px;

  :deep(svg) {
    width: 80px;
    height: 80px;
  }
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--presentation-foreground);
}

.empty-description {
  font-size: 14px;
  color: var(--presentation-foreground);
  opacity: 0.6;
  line-height: 1.5;
}

:deep(.ui-button) {
  margin-top: 8px;
}
</style>
