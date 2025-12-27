<template>
  <div class="editor-sidebar">
    <div class="sidebar-tabs">
      <button
        v-for="tab in visibleTabs"
        :key="tab.key"
        class="sidebar-tab"
        :class="{ active: isActive(tab.key) }"
        @click="handleTabClick(tab.key)"
        :title="tab.tooltip"
        :aria-label="tab.tooltip"
        :aria-pressed="isActive(tab.key)"
        role="tab"
      >
        <component :is="tab.icon" class="tab-icon" />
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useMainStore, useSlidesStore } from '@/store';
import { ToolbarStates } from '@/types/toolbar';
import { useI18n } from 'vue-i18n';
import useSlideEditLock from '@/hooks/useSlideEditLock';

// Import icons from lucide-vue-next
import {
  Palette,
  SwatchBook,
  Play,
  Paintbrush2,
  Type,
  Move,
  Zap,
  Group,
  AlignCenterHorizontal,
} from 'lucide-vue-next';

interface TabConfig {
  key: ToolbarStates;
  icon: any;
  label: string;
  tooltip: string;
}

const { t } = useI18n();
const mainStore = useMainStore();
const slidesStore = useSlidesStore();
const {
  activeElementIdList,
  activeGroupElementId,
  activeElementList,
  handleElement,
  toolbarState,
  sidebarExpanded,
} = storeToRefs(mainStore);
const { currentSlide } = storeToRefs(slidesStore);
const { isCurrentSlideLocked } = useSlideEditLock();

// Tab configuration for element editing
const elementTabs = computed<TabConfig[]>(() => {
  const tabs: TabConfig[] = [
    {
      key: ToolbarStates.EL_STYLE,
      icon: Paintbrush2,
      label: t('toolbar.categories.style'),
      tooltip: t('toolbar.categories.style'),
    },
    {
      key: ToolbarStates.EL_POSITION,
      icon: Move,
      label: t('toolbar.categories.position'),
      tooltip: t('toolbar.categories.position'),
    },
    {
      key: ToolbarStates.EL_ANIMATION,
      icon: Zap,
      label: t('toolbar.categories.animation'),
      tooltip: t('toolbar.categories.animation'),
    },
  ];

  // Insert Symbol tab for text elements
  if (handleElement.value?.type === 'text') {
    tabs.splice(1, 0, {
      key: ToolbarStates.SYMBOL,
      icon: Type,
      label: t('toolbar.categories.symbol'),
      tooltip: t('toolbar.categories.symbol'),
    });
  }

  return tabs;
});

// Tab configuration for slide editing
const slideTabs = computed<TabConfig[]>(() => {
  const tabs: TabConfig[] = [
    {
      key: ToolbarStates.SLIDE_DESIGN,
      icon: Palette,
      label: t('toolbar.categories.design'),
      tooltip: t('toolbar.categories.design'),
    },
    {
      key: ToolbarStates.SLIDE_ANIMATION,
      icon: Play,
      label: t('toolbar.categories.transition'),
      tooltip: t('toolbar.categories.transition'),
    },
    {
      key: ToolbarStates.EL_ANIMATION,
      icon: Zap,
      label: t('toolbar.categories.animation'),
      tooltip: t('toolbar.categories.animation'),
    },
  ];

  // Insert template tab if slide is locked and has layout
  if (isCurrentSlideLocked.value && currentSlide.value?.layout) {
    tabs.splice(1, 0, {
      key: ToolbarStates.SLIDE_TEMPLATE,
      icon: SwatchBook,
      label: t('toolbar.categories.template'),
      tooltip: t('toolbar.categories.template'),
    });
  }

  return tabs;
});

// Tab configuration for multi-select
const multiSelectTabs = computed<TabConfig[]>(() => [
  {
    key: ToolbarStates.MULTI_STYLE,
    icon: Group,
    label: t('toolbar.categories.styleMulti'),
    tooltip: t('toolbar.categories.styleMulti'),
  },
  {
    key: ToolbarStates.MULTI_POSITION,
    icon: AlignCenterHorizontal,
    label: t('toolbar.categories.positionMulti'),
    tooltip: t('toolbar.categories.positionMulti'),
  },
]);

// Determine which tabs to show based on selection
const visibleTabs = computed(() => {
  if (!activeElementIdList.value.length) return slideTabs.value;
  else if (activeElementIdList.value.length > 1) {
    if (!activeGroupElementId.value) return multiSelectTabs.value;

    const activeGroupElement = activeElementList.value.find((item) => item.id === activeGroupElementId.value);
    if (activeGroupElement) return elementTabs.value;
    return multiSelectTabs.value;
  }
  return elementTabs.value;
});

// Check if tab is active
const isActive = (tabKey: ToolbarStates) => {
  return toolbarState.value === tabKey && sidebarExpanded.value;
};

// Handle tab click - toggle behavior
const handleTabClick = (tabKey: ToolbarStates) => {
  if (toolbarState.value === tabKey && sidebarExpanded.value) {
    // Clicking same tab closes the panel
    mainStore.setSidebarExpanded(false);
  } else {
    // Clicking different tab or opening panel
    mainStore.setToolbarState(tabKey);
    mainStore.setSidebarExpanded(true);
  }
};

// Watch for tab changes and ensure valid selection
watch(
  visibleTabs,
  () => {
    const currentTabKeys: ToolbarStates[] = visibleTabs.value.map((tab) => tab.key);
    if (!currentTabKeys.includes(toolbarState.value)) {
      mainStore.setToolbarState(currentTabKeys[0]);
    }
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
.editor-sidebar {
  width: 90px;
  height: 100%;
  background-color: var(--presentation-background);
  border-left: 1px solid var(--presentation-border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  z-index: 2;
}

.sidebar-tabs {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 4px;
}

.sidebar-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 56px;
  width: 82px;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--presentation-foreground);
  padding: 6px 4px;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  &.active {
    background-color: var(--presentation-primary);
    color: white;

    .tab-icon {
      opacity: 1;
    }
  }

  .tab-icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    opacity: 0.7;
  }

  .tab-label {
    font-size: 11px;
    font-weight: 500;
    line-height: 1.2;
    text-align: center;
    word-wrap: break-word;
    max-width: 100%;
  }
}

@media (max-width: 1200px) {
  .editor-sidebar {
    width: 75px;
  }

  .sidebar-tabs {
    padding: 6px 2px;
  }

  .sidebar-tab {
    width: 70px;
    height: 52px;
    gap: 3px;
    padding: 4px 2px;

    .tab-icon {
      width: 18px;
      height: 18px;
    }

    .tab-label {
      font-size: 10px;
    }
  }
}
</style>
