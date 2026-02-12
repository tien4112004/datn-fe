<template>
  <div class="image-preview-confirm">
    <div class="step-indicator">
      <span class="step-label">Generated Image Preview</span>
    </div>

    <ImagePreview :src="generatedUrl" alt="Generated image" />

    <div class="button-group">
      <Button variant="default" fullWidth @click="$emit('confirm')" :disabled="isProcessing">
        <IconImage class="btn-icon" /> Replace Image
      </Button>
      <Button variant="outline" fullWidth @click="$emit('cancel')" :disabled="isProcessing"> Cancel </Button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Image as IconImage } from 'lucide-vue-next';
import Button from '@/components/Button.vue';
import ImagePreview from './common/ImagePreview.vue';

interface Props {
  generatedUrl: string;
  isProcessing?: boolean;
}

interface Emits {
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}

withDefaults(defineProps<Props>(), {
  isProcessing: false,
});

defineEmits<Emits>();
</script>

<style lang="scss" scoped>
.image-preview-confirm {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--presentation-muted-foreground);
  margin-bottom: 8px;

  .step-label {
    font-weight: 500;
    color: var(--presentation-foreground);
  }
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-icon {
  width: 14px;
  height: 14px;
  margin-right: 4px;
}
</style>
