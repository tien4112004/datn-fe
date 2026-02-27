<template>
  <div class="slide-panel">
    <QuickActionsRow
      :actions="slideQuickActions"
      :disabled="isProcessing"
      @action-click="handleQuickAction"
    />

    <div class="ai-disclaimer-container">
      <Info :size="14" class="ai-disclaimer-icon" />
      <p class="ai-disclaimer">{{ t('panels.aiModification.disclaimer') }}</p>
    </div>

    <ModelSelector
      v-model="selectedModel"
      :models="textModels"
      :is-loading="isLoadingTextModels"
      :is-processing="isProcessing"
      :label="t('panels.aiModification.textGenerationModel.label')"
    />

    <ChatInterface
      v-model="chatInput"
      :is-processing="isProcessing"
      :feedback="{ message: refineMessage, type: refineType }"
      :placeholder="t('panels.aiModification.contextHints.modifySlide')"
      @submit="handleChatSubmit"
    />

    <!-- <LayoutSelector
      :layout-types="layoutTypes"
      :current-layout="currentLayout"
      :is-transforming="isTransforming"
      :get-layout-tooltip="getLayoutTooltip"
      @layout-select="transformLayout"
    /> -->
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { Info } from 'lucide-vue-next';
import { useModelStore } from '@/stores/modelStore';
import { useModels } from '@/services/model/queries';
import { useTextRefinement } from '../composables/useTextRefinement';
import { useLayoutTransformation } from '../composables/useLayoutTransformation';
import { useQuickActions } from '../composables/useQuickActions';
import QuickActionsRow from './common/QuickActionsRow.vue';
import ModelSelector from './common/ModelSelector.vue';
import ChatInterface from './common/ChatInterface.vue';
import LayoutSelector from './common/LayoutSelector.vue';

const { t } = useI18n();

const modelStore = useModelStore();
const { selectedModel, textModels } = storeToRefs(modelStore);
const { isLoading: isLoadingTextModels } = useModels('TEXT');

const { chatInput, isProcessing, refineMessage, refineType, currentOperation, refineSlideContent } =
  useTextRefinement();
const { currentLayout, isTransforming, layoutTypes, transformLayout, getLayoutTooltip } =
  useLayoutTransformation();
const { slideQuickActions } = useQuickActions();

function handleQuickAction(action: any) {
  chatInput.value = action.instruction;
  currentOperation.value = action.operation;
  refineSlideContent(action.instruction);
}

async function handleChatSubmit() {
  await refineSlideContent(chatInput.value);
}
</script>

<style lang="scss" scoped>
.slide-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
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
