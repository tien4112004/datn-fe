<template>
  <div class="ai-modification-panel">
    <!-- Context Badge -->
    <div class="context-section">
      <ContextBadge :context="currentContext" />
    </div>

    <Divider />

    <!-- Category Tabs - Only show if there are available tabs -->
    <Tabs
      v-if="categoryTabs.length > 0"
      :value="activeCategory"
      @update:value="(val: string | number) => (activeCategory = String(val))"
      :tabs="categoryTabs"
      card
      class="category-tabs"
    />

    <!-- Actions Grid -->
    <div v-if="filteredActions.length > 0" class="actions-section">
      <div class="actions-grid">
        <ActionCard
          v-for="action in filteredActions"
          :key="action.id"
          :action="action"
          :is-active="selectedAction?.id === action.id"
          @click="handleSelectAction(action)"
        />
      </div>
    </div>
    <div v-else class="empty-state">
      <p>No actions available for current selection</p>
    </div>

    <!-- Parameters Section -->
    <template v-if="selectedAction && selectedAction.parameters.length > 0">
      <Divider />
      <div class="parameters-section">
        <ParameterControl
          v-for="param in selectedAction.parameters"
          :key="param.id"
          :parameter="param"
          :model-value="parameterValues[param.id]"
          @update:model-value="updateParameter(param.id, $event)"
        />
      </div>
    </template>

    <!-- Preview Area -->
    <PreviewArea
      v-if="selectedAction"
      :is-loading="isProcessing"
      :error="error"
      :preview-data="previewData"
      @retry="handleApply"
    />

    <!-- Action Buttons -->
    <div v-if="selectedAction" class="action-buttons">
      <Button variant="outline" size="small" @click="handleCancel" :disabled="isProcessing"> Cancel </Button>
      <Button variant="primary" size="small" @click="handleApply" :disabled="isProcessing"> Apply </Button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import Tabs from '@/components/Tabs.vue';
import Button from '@/components/Button.vue';
import Divider from '@/components/Divider.vue';
import ActionCard from './AIModificationPanel/ActionCard.vue';
import ParameterControl from './AIModificationPanel/ParameterControl.vue';
import ContextBadge from './AIModificationPanel/ContextBadge.vue';
import PreviewArea from './AIModificationPanel/PreviewArea.vue';
import { useAIModificationState } from './AIModificationPanel/useAIModificationState';
import { getActionsByCategory } from './AIModificationPanel/actions';
import { aiModificationService } from '@/services/ai/modifications';
import type { AIAction } from '@/types/aiModification';

// State management
const {
  selectedAction,
  parameterValues,
  isProcessing,
  previewData,
  error,
  currentContext,
  availableActions,
  selectAction,
  updateParameter,
  reset,
  setProcessing,
  setError,
  setPreviewData,
} = useAIModificationState();

// Define all possible category tabs
const allCategoryTabs = [
  { key: 'text', label: 'Text' },
  { key: 'generate', label: 'Generate' },
];

// Compute tabs that have available actions
const categoryTabs = computed(() => {
  return allCategoryTabs.filter((tab) => {
    const actionsInCategory = getActionsByCategory(tab.key, availableActions.value);
    return actionsInCategory.length > 0;
  });
});

// Active category tab - default to first available category
const activeCategory = ref<string>(categoryTabs.value[0]?.key || 'text');

// Update active category if it becomes unavailable
const filteredActions = computed(() => {
  const actions = getActionsByCategory(activeCategory.value, availableActions.value);

  // If no actions in current category, switch to first available
  if (actions.length === 0 && categoryTabs.value.length > 0) {
    activeCategory.value = categoryTabs.value[0].key;
    return getActionsByCategory(categoryTabs.value[0].key, availableActions.value);
  }

  return actions;
});

// Watch for changes in available tabs and update active category if needed
watch(categoryTabs, (newTabs) => {
  const isCurrentCategoryAvailable = newTabs.some((tab) => tab.key === activeCategory.value);

  if (!isCurrentCategoryAvailable && newTabs.length > 0) {
    activeCategory.value = newTabs[0].key;
  }
});

// Handle action selection
function handleSelectAction(action: AIAction) {
  selectAction(action);
}

// Handle cancel
function handleCancel() {
  reset();
}

// Handle apply - process with AI
async function handleApply() {
  if (!selectedAction.value) return;

  // Validate required parameters
  const missingParams = selectedAction.value.parameters
    .filter((param) => param.required && !parameterValues.value[param.id])
    .map((param) => param.name);

  if (missingParams.length > 0) {
    setError('Required parameters are missing');
    return;
  }

  setProcessing(true);

  try {
    // Build request
    const request = {
      action: selectedAction.value.id,
      context: {
        type: currentContext.value.type,
        slideId: currentContext.value.type === 'slide' ? 'current-slide-id' : undefined,
        elementId:
          currentContext.value.type === 'element'
            ? 'current-element-id'
            : currentContext.value.type === 'elements'
              ? ['element-1', 'element-2']
              : undefined,
        slideContent: currentContext.value.data,
        elementContent: currentContext.value.data,
      },
      parameters: parameterValues.value,
    };

    // Call AI service
    const response = await aiModificationService.processModification(request);

    if (response.success) {
      // Set preview data
      setPreviewData(
        response.data.modifiedContent ||
          response.data.newSlides ||
          response.data.suggestions ||
          'AI processing completed successfully!'
      );
    } else {
      setError(response.error || 'AI processing failed');
    }
  } catch (err) {
    setError('AI processing failed');
    console.error('AI modification error:', err);
  }
}
</script>

<style lang="scss" scoped>
.ai-modification-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
}

.context-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.category-tabs {
  :deep(.tabs-list) {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    gap: 0.25rem;
  }

  :deep(.tabs-trigger) {
    font-size: 0.75rem;
    padding: 0.5rem 0.75rem;
  }
}

.actions-section {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  text-align: center;
  color: var(--presentation-muted-foreground);
  font-size: 0.8125rem;

  p {
    margin: 0;
  }
}

.parameters-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  padding-top: 0.5rem;
  border-top: 1px solid var(--presentation-border);
}
</style>
