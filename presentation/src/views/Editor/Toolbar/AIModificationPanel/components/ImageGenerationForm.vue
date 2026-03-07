<template>
  <div class="image-generation-form">
    <div class="section-title">{{ t('panels.aiModification.imageGeneration.replaceImage') }}</div>

    <ImagePreview :src="currentImage" :alt="t('panels.aiModification.imageGeneration.imagePreviewAlt')" />

    <InputGroup :label="t('panels.aiModification.imageGeneration.imageDescription')">
      <textarea
        v-model="imagePrompt"
        class="panel-input"
        :placeholder="t('panels.aiModification.imageGeneration.describeImage')"
        rows="3"
      />
    </InputGroup>

    <!-- AI Disclaimer -->
    <div class="ai-disclaimer-container">
      <Info :size="14" class="ai-disclaimer-icon" />
      <p class="ai-disclaimer">{{ t('panels.aiModification.disclaimer') }}</p>
    </div>

    <ArtStyleSelector v-model="selectedStyle" :art-style-options="artStyleOptions" :disabled="isProcessing" />

    <ModelSelector
      v-model="selectedImageModel"
      :models="imageModels"
      :is-loading="isLoadingImageModels"
      :is-processing="isProcessing"
    />

    <ToggleRow
      v-model="matchSlideTheme"
      :label="t('panels.aiModification.imageGeneration.matchSlideTheme')"
    />

    <Button variant="default" fullWidth @click="$emit('generate')" :disabled="isProcessing || !imagePrompt">
      <IconImage class="btn-icon" />
      {{
        isProcessing
          ? t('panels.aiModification.imageGeneration.generating')
          : t('panels.aiModification.imageGeneration.generateImage')
      }}
    </Button>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useModelStore } from '@/stores/modelStore';
import { useModels } from '@/services/model/queries';
import { Image as IconImage, Info } from 'lucide-vue-next';
import Button from '@/components/Button.vue';
import ImagePreview from './common/ImagePreview.vue';
import InputGroup from './common/InputGroup.vue';
import ArtStyleSelector from './common/ArtStyleSelector.vue';
import ModelSelector from './common/ModelSelector.vue';
import ToggleRow from './common/ToggleRow.vue';

const { t } = useI18n();

interface Props {
  currentImage: string;
  imagePrompt: string;
  selectedStyle: string;
  matchSlideTheme: boolean;
  isProcessing: boolean;
  artStyleOptions: Array<{ value: string; label: string; visual?: string }>;
}

interface Emits {
  (e: 'update:imagePrompt', value: string): void;
  (e: 'update:selectedStyle', value: string): void;
  (e: 'update:matchSlideTheme', value: boolean): void;
  (e: 'generate'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const modelStore = useModelStore();
const { selectedImageModel, imageModels } = storeToRefs(modelStore);

// Use TanStack Query for loading state
const { isLoading: isLoadingImageModels } = useModels('IMAGE');

const imagePrompt = computed({
  get: () => props.imagePrompt,
  set: (value) => emit('update:imagePrompt', value),
});

const selectedStyle = computed({
  get: () => props.selectedStyle,
  set: (value) => emit('update:selectedStyle', value),
});

const matchSlideTheme = computed({
  get: () => props.matchSlideTheme,
  set: (value) => emit('update:matchSlideTheme', value),
});
</script>

<style lang="scss" scoped>
.image-generation-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--presentation-foreground);
  margin-bottom: 4px;
}

.panel-input {
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid var(--presentation-border);
  background: var(--presentation-input);
  font-size: 13px;
  color: var(--presentation-foreground);
  font-family: inherit;
  width: 100%;
  box-sizing: border-box;
  resize: vertical;
  min-height: 60px;

  &:focus {
    outline: none;
    border-color: var(--presentation-primary);
  }
}

.btn-icon {
  width: 14px;
  height: 14px;
  margin-right: 4px;
}

.ai-disclaimer-container {
  display: flex;
  align-items: flex-start;
  gap: 6px;
}

.ai-disclaimer-icon {
  flex-shrink: 0;
  margin-top: 2px;
  color: var(--presentation-muted-foreground, rgba(0, 0, 0, 0.45));
}

:root[data-theme='dark'] .ai-disclaimer-icon {
  color: rgba(255, 255, 255, 0.4);
}

.ai-disclaimer {
  font-size: 11px;
  color: var(--presentation-muted-foreground, rgba(0, 0, 0, 0.45));
  margin: 0;
  line-height: 1.5;
  font-style: italic;
}

:root[data-theme='dark'] .ai-disclaimer {
  color: rgba(255, 255, 255, 0.4);
}
</style>
