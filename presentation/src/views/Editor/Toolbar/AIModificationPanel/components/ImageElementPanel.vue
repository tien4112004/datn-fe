<template>
  <div class="image-element-panel">
    <!-- Step 1: Generation (shown when no image generated yet) -->
    <ImageGenerationForm
      v-if="!generatedImageUrl"
      :current-image="element.src"
      :image-prompt="imagePrompt"
      :selected-style="selectedStyle"
      :match-slide-theme="matchSlideTheme"
      :is-processing="isProcessing"
      :art-style-options="artStyleOptions"
      @update:imagePrompt="imagePrompt = $event"
      @update:selectedStyle="selectedStyle = $event"
      @update:matchSlideTheme="matchSlideTheme = $event"
      @generate="handleGenerateImage"
    />

    <!-- Step 2: Preview and Replace (shown after image generated) -->
    <ImagePreviewConfirm
      v-else
      :generated-url="generatedImageUrl"
      :is-processing="isProcessing"
      @confirm="handleConfirmReplacement"
      @cancel="handleCancelGeneration"
    />
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import type { PPTImageElement } from '@/types/slides';
import { useImageGeneration } from '../composables/useImageGeneration';
import { useArtStyles } from '../composables/useArtStyles';
import ImageGenerationForm from './ImageGenerationForm.vue';
import ImagePreviewConfirm from './ImagePreviewConfirm.vue';

interface Props {
  element: PPTImageElement;
}

const props = defineProps<Props>();

const {
  imagePrompt,
  selectedStyle,
  matchSlideTheme,
  generatedImageUrl,
  isProcessing,
  generateImage,
  confirmReplacement,
  cancelGeneration,
} = useImageGeneration();

const { artStyleOptions, availableArtStyles, fetchArtStyles } = useArtStyles();

// Fetch art styles on component mount
onMounted(() => {
  fetchArtStyles();
});

async function handleGenerateImage() {
  // Pass available art styles (with modifiers) to include artDescription in the request
  await generateImage(props.element.id, availableArtStyles.value);
}

async function handleConfirmReplacement() {
  await confirmReplacement(props.element.id);
}

function handleCancelGeneration() {
  cancelGeneration();
}
</script>

<style lang="scss" scoped>
.image-element-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
