<template>
  <div class="slide-panel">
    <div v-if="isPreviewMode" class="slide-tabs">
      <div class="slide-tab" :class="{ active: activeTab === 'refine' }" @click="activeTab = 'refine'">
        {{ t('panels.aiModification.slideGeneration.tabRefine') }}
      </div>
      <div class="slide-tab" :class="{ active: activeTab === 'generate' }" @click="activeTab = 'generate'">
        {{ t('panels.aiModification.slideGeneration.tabGenerate') }}
      </div>
    </div>

    <!-- Refine tab (only in preview mode) -->
    <template v-if="isPreviewMode && activeTab === 'refine'">
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
    </template>

    <!-- Generate tab -->
    <SlideGenerationPanel v-else />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { Info } from 'lucide-vue-next';
import { useSlidesStore } from '@/store';
import { useModelStore } from '@/stores/modelStore';
import { useModels } from '@/services/model/queries';
import { useTextRefinement } from '../composables/useTextRefinement';
import { useLayoutTransformation } from '../composables/useLayoutTransformation';
import { useQuickActions } from '../composables/useQuickActions';
import QuickActionsRow from './common/QuickActionsRow.vue';
import ModelSelector from './common/ModelSelector.vue';
import ChatInterface from './common/ChatInterface.vue';
import LayoutSelector from './common/LayoutSelector.vue';
import SlideGenerationPanel from './SlideGenerationPanel.vue';

const { t } = useI18n();

const slidesStore = useSlidesStore();
const { currentSlide } = storeToRefs(slidesStore);
const isPreviewMode = computed(() => !!currentSlide.value?.layout?.schema);

const activeTab = ref<'refine' | 'generate'>('refine');

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

.slide-tabs {
  display: flex;
  gap: 4px;
  border-radius: var(--presentation-radius, 6px);
  position: sticky;
  top: -1rem;
  z-index: 1;
  margin: -1rem -1rem 0;
  padding: 0.75rem 1rem;
  background: var(--presentation-card, #fff);
  border-bottom: 1px solid var(--presentation-border);
}

.slide-tab {
  flex: 1;
  padding: 6px 12px;
  border-radius: calc(var(--presentation-radius, 6px) - 2px);
  font-size: 13px;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  color: var(--presentation-muted-foreground);
  background: var(--presentation-muted, rgba(0, 0, 0, 0.04));
  transition: all 0.15s;
  user-select: none;

  &:hover:not(.active) {
    color: var(--presentation-foreground);
  }

  &.active {
    background: var(--presentation-primary);
    color: #fff;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
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
