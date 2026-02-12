<template>
  <div class="text-element-panel">
    <div class="context-hint">
      <IconText class="hint-icon" />
      <span>Refining selected text element</span>
    </div>

    <QuickActionsRow :actions="textQuickActions" :disabled="isProcessing" @action-click="handleQuickAction" />

    <ChatInterface
      v-model="chatInput"
      :is-processing="isProcessing"
      :feedback="{ message: refineMessage, type: refineType }"
      placeholder="Describe how to modify this text..."
      @submit="handleRefine"
    />
  </div>
</template>

<script lang="ts" setup>
import type { PPTTextElement } from '@/types/slides';
import { Type as IconText } from 'lucide-vue-next';
import { useTextRefinement } from '../composables/useTextRefinement';
import { useQuickActions } from '../composables/useQuickActions';
import QuickActionsRow from './common/QuickActionsRow.vue';
import ChatInterface from './common/ChatInterface.vue';

interface Props {
  element: PPTTextElement;
}

const props = defineProps<Props>();

const { chatInput, isProcessing, refineMessage, refineType, currentOperation, refineElementText } =
  useTextRefinement();
const { textQuickActions } = useQuickActions();

function handleQuickAction(action: any) {
  chatInput.value = action.instruction;
  currentOperation.value = action.operation;
  handleRefine();
}

async function handleRefine() {
  currentOperation.value = currentOperation.value || 'expand';
  await refineElementText(props.element.id, props.element.content, chatInput.value);
}
</script>

<style lang="scss" scoped>
.text-element-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.context-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--presentation-muted-foreground);

  .hint-icon {
    width: 13px;
    height: 13px;
  }
}
</style>
