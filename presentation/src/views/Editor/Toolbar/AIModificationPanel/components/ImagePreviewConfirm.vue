<template>
  <div class="image-preview-confirm">
    <div class="step-indicator">
      <span class="step-label">{{ t('panels.aiModification.imageGeneration.generatedPreview') }}</span>
    </div>

    <ImagePreview :src="generatedUrl" :alt="t('panels.aiModification.imageGeneration.imagePreviewAlt')" />

    <div class="button-group">
      <Button variant="default" fullWidth @click="$emit('confirm')" :disabled="isProcessing">
        <IconImage class="btn-icon" /> {{ t('panels.aiModification.buttons.replaceImage') }}
      </Button>
      <Button variant="outline" fullWidth @click="$emit('cancel')" :disabled="isProcessing">
        {{ t('panels.aiModification.buttons.cancel') }}
      </Button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { Image as IconImage } from 'lucide-vue-next';
import Button from '@/components/Button.vue';
import ImagePreview from './common/ImagePreview.vue';

const { t } = useI18n();

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
