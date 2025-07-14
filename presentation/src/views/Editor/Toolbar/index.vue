<template>
  <Card class="toolbar" padding="normal">
    <Tabs
      class="toolbar-tabs"
      :tabs="currentTabs"
      :value="toolbarState"
      card
      @update:value="(key) => setToolbarState(key as ToolbarStates)"
    />

    <div class="content">
      <component :is="currentPanelComponent"></component>
    </div>
  </Card>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useMainStore } from '@/store';
import { ToolbarStates } from '@/types/toolbar';
import { useI18n } from 'vue-i18n';

import ElementStylePanel from './ElementStylePanel/index.vue';
import ElementPositionPanel from './ElementPositionPanel.vue';
import ElementAnimationPanel from './ElementAnimationPanel.vue';
import SlideDesignPanel from './SlideDesignPanel/index.vue';
import SlideAnimationPanel from './SlideTransitionPanel.vue';
import MultiPositionPanel from './MultiPositionPanel.vue';
import MultiStylePanel from './MultiStylePanel.vue';
import SymbolPanel from './SymbolPanel.vue';
import Tabs from '@/components/Tabs.vue';
import Card from '@/components/Card.vue';

interface ElementTabs {
  label: string;
  key: ToolbarStates;
}

const { t } = useI18n();
const mainStore = useMainStore();
const { activeElementIdList, activeElementList, activeGroupElementId, handleElement, toolbarState } =
  storeToRefs(mainStore);

const elementTabs = computed<ElementTabs[]>(() => {
  if (handleElement.value?.type === 'text') {
    return [
      { label: t('toolbar.categories.style'), key: ToolbarStates.EL_STYLE },
      { label: t('toolbar.categories.symbol'), key: ToolbarStates.SYMBOL },
      { label: t('toolbar.categories.position'), key: ToolbarStates.EL_POSITION },
      { label: t('toolbar.categories.animation'), key: ToolbarStates.EL_ANIMATION },
    ];
  }
  return [
    { label: t('toolbar.categories.style'), key: ToolbarStates.EL_STYLE },
    { label: t('toolbar.categories.position'), key: ToolbarStates.EL_POSITION },
    { label: t('toolbar.categories.animation'), key: ToolbarStates.EL_ANIMATION },
  ];
});
const slideTabs = computed(() => [
  { label: t('toolbar.categories.design'), key: ToolbarStates.SLIDE_DESIGN },
  { label: t('toolbar.categories.transition'), key: ToolbarStates.SLIDE_ANIMATION },
  { label: t('toolbar.categories.animation'), key: ToolbarStates.EL_ANIMATION },
]);
const multiSelectTabs = [
  { label: 'Style (Multi-select)', key: ToolbarStates.MULTI_STYLE },
  { label: 'Position (Multi-select)', key: ToolbarStates.MULTI_POSITION },
];

const setToolbarState = (value: ToolbarStates) => {
  mainStore.setToolbarState(value);
};

const currentTabs = computed(() => {
  if (!activeElementIdList.value.length) return slideTabs.value;
  else if (activeElementIdList.value.length > 1) {
    if (!activeGroupElementId.value) return multiSelectTabs;

    const activeGroupElement = activeElementList.value.find((item) => item.id === activeGroupElementId.value);
    if (activeGroupElement) return elementTabs.value;
    return multiSelectTabs;
  }
  return elementTabs.value;
});

watch(currentTabs, () => {
  const currentTabsValue: ToolbarStates[] = currentTabs.value.map((tab) => tab.key);
  if (!currentTabsValue.includes(toolbarState.value)) {
    mainStore.setToolbarState(currentTabsValue[0]);
  }
});

const currentPanelComponent = computed(() => {
  const panelMap = {
    [ToolbarStates.EL_STYLE]: ElementStylePanel,
    [ToolbarStates.EL_POSITION]: ElementPositionPanel,
    [ToolbarStates.EL_ANIMATION]: ElementAnimationPanel,
    [ToolbarStates.SLIDE_DESIGN]: SlideDesignPanel,
    [ToolbarStates.SLIDE_ANIMATION]: SlideAnimationPanel,
    [ToolbarStates.MULTI_STYLE]: MultiStylePanel,
    [ToolbarStates.MULTI_POSITION]: MultiPositionPanel,
    [ToolbarStates.SYMBOL]: SymbolPanel,
  };
  return panelMap[toolbarState.value] || null;
});
</script>

<style lang="scss" scoped>
.toolbar {
  color: $textColor;
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

.content {
  padding: $extraLargeSpacing;
  font-size: $smTextSize;
  flex: 1;

  min-width: 0;
  width: 100%;

  @include overflow-overlay();
}

.toolbar-tabs {
  margin: 2px;
}
</style>
