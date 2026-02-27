<template>
  <div class="combined-text-panel">
    <ContextBadge :context="context" />

    <QuickActionsRow
      :actions="combinedTextQuickActions"
      :disabled="isProcessing"
      @action-click="handleQuickAction"
    />

    <div class="ai-disclaimer-container">
      <Info :size="14" class="ai-disclaimer-icon" />
      <p class="ai-disclaimer">{{ t('panels.aiModification.disclaimer') }}</p>
    </div>

    <ChatInterface
      v-model="chatInput"
      :is-processing="isProcessing"
      :feedback="{ message: refineMessage, type: refineType }"
      :placeholder="t('panels.aiModification.contextHints.modifyItems')"
      @submit="handleRefine"
    />
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { Info } from 'lucide-vue-next';
import type { CurrentContext } from '@/types/aiModification';
import { useTextRefinement } from '../composables/useTextRefinement';
import { useQuickActions } from '../composables/useQuickActions';
import ContextBadge from '../ContextBadge.vue';
import QuickActionsRow from './common/QuickActionsRow.vue';
import ChatInterface from './common/ChatInterface.vue';

const { t } = useI18n();

interface Props {
  context: CurrentContext;
}

const props = defineProps<Props>();

const { chatInput, isProcessing, refineMessage, refineType, currentOperation, refineCombinedText } =
  useTextRefinement();
const { combinedTextQuickActions } = useQuickActions();

function handleQuickAction(action: any) {
  chatInput.value = action.instruction;
  currentOperation.value = action.operation;
  handleRefine();
}

async function handleRefine() {
  const data = props.context.data as any;
  currentOperation.value = currentOperation.value || 'expand';
  await refineCombinedText(data.items, data.schema, chatInput.value);
}
</script>

<style lang="scss" scoped>
.combined-text-panel {
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
