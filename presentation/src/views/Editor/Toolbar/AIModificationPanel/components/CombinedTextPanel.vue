<template>
  <div class="combined-text-panel">
    <ContextBadge :context="context" />

    <QuickActionsRow
      :actions="combinedTextQuickActions"
      :disabled="isProcessing"
      @action-click="handleQuickAction"
    />

    <ChatInterface
      v-model="chatInput"
      :is-processing="isProcessing"
      :feedback="{ message: refineMessage, type: refineType }"
      placeholder="Describe how to modify these items..."
      @submit="handleRefine"
    />
  </div>
</template>

<script lang="ts" setup>
import type { CurrentContext } from '@/types/aiModification';
import { useTextRefinement } from '../composables/useTextRefinement';
import { useQuickActions } from '../composables/useQuickActions';
import ContextBadge from '../ContextBadge.vue';
import QuickActionsRow from './common/QuickActionsRow.vue';
import ChatInterface from './common/ChatInterface.vue';

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
</style>
