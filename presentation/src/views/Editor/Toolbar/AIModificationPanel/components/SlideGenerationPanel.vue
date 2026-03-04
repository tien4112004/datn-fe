<template>
  <div class="slide-generation-panel">
    <!-- Prompt -->
    <InputGroup :label="t('panels.aiModification.slideGeneration.prompt')">
      <textarea
        v-model="prompt"
        class="prompt-textarea"
        :placeholder="t('panels.aiModification.slideGeneration.promptPlaceholder')"
        :disabled="isProcessing"
        rows="3"
      />
    </InputGroup>

    <!-- Slide count -->
    <InputGroup :label="t('panels.aiModification.slideGeneration.slideCount')">
      <select v-model="slideCount" class="slide-count-select" :disabled="isProcessing">
        <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
      </select>
    </InputGroup>

    <!-- LLM Model -->
    <ModelSelector
      v-model="modelStore.selectedModel"
      :models="modelStore.textModels"
      :is-processing="isProcessing"
      :label="t('panels.aiModification.textGenerationModel.label')"
    />

    <!-- Art Style -->
    <ArtStyleSelector
      v-model="selectedArtStyle"
      :art-style-options="artStyleOptions"
      :disabled="isProcessing"
    />

    <!-- Image Model -->
    <ModelSelector
      v-model="modelStore.selectedImageModel"
      :models="modelStore.imageModels"
      :is-processing="isProcessing"
      :label="t('panels.aiModification.imageGenerationModel.label')"
    />

    <!-- Negative Prompt -->
    <InputGroup :label="t('panels.aiModification.slideGeneration.negativePrompt')">
      <input
        v-model="negativePrompt"
        type="text"
        class="negative-prompt-input"
        :placeholder="t('panels.aiModification.slideGeneration.negativePromptPlaceholder')"
        :disabled="isProcessing"
      />
    </InputGroup>

    <!-- Feedback -->
    <FeedbackMessage v-if="feedbackMessage" :type="feedbackType">
      {{ feedbackMessage }}
    </FeedbackMessage>

    <!-- Generate button -->
    <button class="generate-btn" :disabled="!canGenerate" @click="generateSlides()">
      <div v-if="isProcessing" class="spinner"></div>
      <IconMagic v-else class="btn-icon" />
      {{
        isProcessing
          ? t('panels.aiModification.slideGeneration.generating')
          : t('panels.aiModification.slideGeneration.generate')
      }}
    </button>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { useModelStore } from '@/stores/modelStore';
import { useSlideGeneration } from '../composables/useSlideGeneration';
import { useArtStyles } from '../composables/useArtStyles';
import ModelSelector from './common/ModelSelector.vue';
import ArtStyleSelector from './common/ArtStyleSelector.vue';
import InputGroup from './common/InputGroup.vue';
import FeedbackMessage from './common/FeedbackMessage.vue';

const { t } = useI18n();
const modelStore = useModelStore();

const {
  prompt,
  slideCount,
  selectedArtStyle,
  negativePrompt,
  isProcessing,
  feedbackMessage,
  feedbackType,
  canGenerate,
  generateSlides,
} = useSlideGeneration();

const { artStyleOptions } = useArtStyles();
</script>

<style lang="scss" scoped>
.slide-generation-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.prompt-textarea {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--presentation-border);
  border-radius: 6px;
  background: var(--presentation-input);
  color: var(--presentation-foreground);
  font-size: 13px;
  font-family: inherit;
  resize: vertical;
  min-height: 60px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: var(--presentation-primary);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.slide-count-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--presentation-border);
  border-radius: 6px;
  background: var(--presentation-input);
  color: var(--presentation-foreground);
  font-size: 14px;
  cursor: pointer;
  font-family: inherit;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus {
    outline: none;
    border-color: var(--presentation-primary);
  }
}

.negative-prompt-input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--presentation-border);
  border-radius: 6px;
  background: var(--presentation-input);
  color: var(--presentation-foreground);
  font-size: 13px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: var(--presentation-primary);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.generate-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  background: var(--presentation-primary);
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.btn-icon {
  width: 14px;
  height: 14px;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
