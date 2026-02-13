<template>
  <div class="slide-panel">
    <QuickActionsRow
      :actions="slideQuickActions"
      :disabled="isProcessing"
      @action-click="handleQuickAction"
    />

    <ChatInterface
      v-model="chatInput"
      :is-processing="isProcessing"
      :feedback="{ message: refineMessage, type: refineType }"
      :placeholder="t('panels.aiModification.contextHints.modifySlide')"
      @submit="handleChatSubmit"
    />

    <LayoutSelector
      :layout-types="layoutTypes"
      :current-layout="currentLayout"
      :is-transforming="isTransforming"
      :get-layout-tooltip="getLayoutTooltip"
      @layout-select="transformLayout"
    />
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { useTextRefinement } from '../composables/useTextRefinement';
import { useLayoutTransformation } from '../composables/useLayoutTransformation';
import { useQuickActions } from '../composables/useQuickActions';
import QuickActionsRow from './common/QuickActionsRow.vue';
import ChatInterface from './common/ChatInterface.vue';
import LayoutSelector from './common/LayoutSelector.vue';

const { t } = useI18n();

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
</style>
