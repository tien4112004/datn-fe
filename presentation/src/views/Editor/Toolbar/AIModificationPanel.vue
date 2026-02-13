<template>
  <div class="ai-modification-panel">
    <div class="panel-content">
      <!-- Multi-select: show info message -->
      <InfoMessage
        v-if="currentContext.type === 'elements'"
        :icon="IconInfo"
        :message="t('panels.aiModification.states.selectSingleElement')"
      />

      <!-- Combined Text Context -->
      <CombinedTextPanel v-else-if="currentContext.type === 'combined-text'" :context="currentContext" />

      <!-- Single Text Element -->
      <TextElementPanel
        v-else-if="currentContext.type === 'element' && currentContext.elementType === 'text'"
        :element="currentContext.data"
      />

      <!-- Image Element -->
      <ImageElementPanel
        v-else-if="currentContext.type === 'element' && currentContext.elementType === 'image'"
        :element="currentContext.data"
      />

      <!-- Other Elements -->
      <InfoMessage
        v-else-if="currentContext.type === 'element'"
        :icon="IconInfo"
        :message="t('panels.aiModification.states.noActionsForElementType')"
      />

      <!-- Slide Context -->
      <SlidePanel v-else />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useModelStore } from '@/stores/modelStore';
import { useDefaultModel, useModels } from '@/services/model/queries';
import { useAIModificationState } from './AIModificationPanel/useAIModificationState';
import { useArtStyles } from './AIModificationPanel/composables/useArtStyles';
import { Info as IconInfo } from 'lucide-vue-next';
import InfoMessage from './AIModificationPanel/components/common/InfoMessage.vue';
import CombinedTextPanel from './AIModificationPanel/components/CombinedTextPanel.vue';
import TextElementPanel from './AIModificationPanel/components/TextElementPanel.vue';
import ImageElementPanel from './AIModificationPanel/components/ImageElementPanel.vue';
import SlidePanel from './AIModificationPanel/components/SlidePanel.vue';

const { t } = useI18n();

const modelStore = useModelStore();
const { currentContext } = useAIModificationState();
const { fetchArtStyles } = useArtStyles();

// Fetch default TEXT model and sync to store
const { data: defaultTextModel } = useDefaultModel('TEXT');
watch(
  defaultTextModel,
  (model) => {
    if (model) {
      modelStore.selectedModel = model;
    }
  },
  { immediate: true }
);

// Fetch IMAGE models and default, sync to store
const { data: imageModels } = useModels('IMAGE');
const { data: defaultImageModel } = useDefaultModel('IMAGE');

watch(
  imageModels,
  (models) => {
    if (models) {
      modelStore.imageModels = models;
    }
  },
  { immediate: true }
);

watch(
  defaultImageModel,
  (model) => {
    if (model) {
      modelStore.selectedImageModel = model;
    } else if (modelStore.imageModels.length > 0) {
      modelStore.selectedImageModel = modelStore.imageModels[0];
    }
  },
  { immediate: true }
);

// Fetch art styles on component mount
fetchArtStyles();
</script>

<style lang="scss" scoped>
.ai-modification-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.panel-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  @include overflow-overlay();
}
</style>
