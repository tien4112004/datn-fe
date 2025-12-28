<template>
  <Card v-if="sidebarExpanded" class="toolbar" padding="normal">
    <div class="panel-header">
      <h3 class="panel-title">{{ currentPanelTitle }}</h3>
      <button class="close-button" @click="closeSidebar" :title="t('ui.actions.close')">
        <IconClose />
      </button>
    </div>
    <div class="content">
      <component :is="currentPanelComponent"></component>
    </div>
  </Card>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useMainStore } from '@/store';
import { ToolbarStates } from '@/types/toolbar';
import { useI18n } from 'vue-i18n';
import { X as IconClose } from 'lucide-vue-next';

const { t } = useI18n();

import ElementStylePanel from './ElementStylePanel/index.vue';
import ElementPositionPanel from './ElementPositionPanel.vue';
import ElementAnimationPanel from './ElementAnimationPanel.vue';
import SlideDesignPanel from './SlideDesignPanel/index.vue';
import SlideAnimationPanel from './SlideTransitionPanel.vue';
import SlideTemplatePanel from './SlideTemplatePanel.vue';
import MultiPositionPanel from './MultiPositionPanel.vue';
import MultiStylePanel from './MultiStylePanel.vue';
import SymbolPanel from './SymbolPanel.vue';
import ImageLibPanel from '../ImageLibPanel.vue';
import AIModificationPanel from './AIModificationPanel.vue';
import Card from '@/components/Card.vue';

const mainStore = useMainStore();
const { toolbarState, sidebarExpanded } = storeToRefs(mainStore);

const closeSidebar = () => {
  mainStore.setSidebarExpanded(false);
};

const currentPanelTitle = computed(() => {
  const titleMap = {
    [ToolbarStates.EL_STYLE]: t('toolbar.categories.style'),
    [ToolbarStates.EL_POSITION]: t('toolbar.categories.position'),
    [ToolbarStates.EL_ANIMATION]: t('toolbar.categories.animation'),
    [ToolbarStates.SLIDE_DESIGN]: t('toolbar.categories.design'),
    [ToolbarStates.SLIDE_TEMPLATE]: t('toolbar.categories.template'),
    [ToolbarStates.SLIDE_ANIMATION]: t('toolbar.categories.transition'),
    [ToolbarStates.MULTI_STYLE]: t('toolbar.categories.styleMulti'),
    [ToolbarStates.MULTI_POSITION]: t('toolbar.categories.positionMulti'),
    [ToolbarStates.SYMBOL]: t('toolbar.categories.symbol'),
    [ToolbarStates.IMAGE_LIBRARY]: t('toolbar.categories.imageLibrary'),
    [ToolbarStates.AI_MODIFICATION]: t('toolbar.categories.aiModification'),
  };
  return titleMap[toolbarState.value] || '';
});

const currentPanelComponent = computed(() => {
  const panelMap = {
    [ToolbarStates.EL_STYLE]: ElementStylePanel,
    [ToolbarStates.EL_POSITION]: ElementPositionPanel,
    [ToolbarStates.EL_ANIMATION]: ElementAnimationPanel,
    [ToolbarStates.SLIDE_DESIGN]: SlideDesignPanel,
    [ToolbarStates.SLIDE_TEMPLATE]: SlideTemplatePanel,
    [ToolbarStates.SLIDE_ANIMATION]: SlideAnimationPanel,
    [ToolbarStates.MULTI_STYLE]: MultiStylePanel,
    [ToolbarStates.MULTI_POSITION]: MultiPositionPanel,
    [ToolbarStates.SYMBOL]: SymbolPanel,
    [ToolbarStates.IMAGE_LIBRARY]: ImageLibPanel,
    [ToolbarStates.AI_MODIFICATION]: AIModificationPanel,
  };
  return panelMap[toolbarState.value] || null;
});
</script>

<style lang="scss" scoped>
.toolbar {
  color: var(--presentation-foreground);
  height: 100%;
  width: 100%;
  max-width: 100%;
  overflow: hidden;

  :deep(.card-content) {
    display: flex;
    flex-direction: column;
    height: 100%;
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }
}

.panel-header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--presentation-border);
  background-color: var(--presentation-secondary);
  border-radius: var(--presentation-radius) var(--presentation-radius) 0 0;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--presentation-secondary-foreground);
  margin: 0;
  text-transform: capitalize;
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: var(--presentation-secondary-foreground);
  transition: all 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  svg {
    width: 16px;
    height: 16px;
  }
}

.content {
  padding: 1rem;
  font-size: 0.8125rem;
  flex: 1;
  min-width: 0;
  width: 100%;
  min-height: 0;

  @include overflow-overlay();
}
</style>
