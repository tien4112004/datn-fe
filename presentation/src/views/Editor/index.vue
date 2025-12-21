<template>
  <div
    class="pptist-editor"
    :class="{ 'view-mode': mode === 'view', 'show-left': showLeftOnMobile, 'show-right': showRightOnMobile }"
  >
    <EditorHeader class="layout-header" />
    <div class="layout-content">
      <Thumbnails class="layout-content-left" />
      <div class="layout-content-center">
        <div class="center-top center-top-wrapper">
          <CanvasTool v-if="mode === 'edit'" />

          <div class="mobile-panel-toggle" v-if="mode === 'edit'">
            <button class="mobile-toggle-btn" @click="toggleLeftPanel" aria-label="Toggle Thumbnails">
              ☰
            </button>
            <button class="mobile-toggle-btn" @click="toggleRightPanel" aria-label="Toggle Toolbar">
              ⚙
            </button>
          </div>
        </div>

        <!-- Template Preview Mode Banner -->
        <div v-if="isCurrentSlideLocked" class="preview-mode-banner">
          <div class="banner-content">
            <div class="banner-icon">
              <IconSwatchBook />
            </div>
            <div class="banner-text">
              <div class="banner-title">Template Preview Mode</div>
              <div class="banner-subtitle">
                Choose your preferred layout. Editing will unlock after you confirm your template choice.
              </div>
            </div>
            <div class="banner-buttons">
              <button class="banner-button" @click="confirmCurrentTemplate">
                <IconCheckOne />
                Confirm & Start Editing
              </button>
              <button
                v-if="hasLockedSlides && !showConfirmAllButton"
                class="banner-button banner-button-secondary"
                @click="promptConfirmAll"
              >
                <IconCheckOne />
                Confirm All Slides
              </button>
              <button
                v-if="showConfirmAllButton"
                class="banner-button banner-button-confirm"
                @click="confirmAllTemplates"
              >
                <IconCheckOne />
                Click Again to Confirm All
              </button>
            </div>
          </div>
        </div>

        <Canvas class="center-body" :readonly="mode === 'view'" />
        <div v-if="mode === 'edit'" class="center-bottom" @click="openRemarkDrawer">
          <div class="remark-preview">
            <div
              class="remark-content"
              :class="{ empty: !currentSlide?.remark }"
              v-html="currentSlide?.remark || ''"
            ></div>
            <div class="remark-hint">
              <span>{{ currentSlide?.remark ? 'Click to edit notes' : 'Click to add notes' }}</span>
            </div>
          </div>
        </div>
      </div>
      <Toolbar v-if="mode === 'edit'" class="layout-content-right" />
    </div>
  </div>

  <template v-if="mode === 'edit'">
    <SelectPanel v-if="showSelectPanel" />
    <SearchPanel v-if="showSearchPanel" />
    <NotesPanel v-if="showNotesPanel" />
    <MarkupPanel v-if="showMarkupPanel" />

    <Drawer v-model:visible="showRemarkDrawer" placement="bottom">
      <template #title>
        <span>Slide Remarks</span>
      </template>
      <Remark v-model:height="remarkHeight" :style="{ height: `${remarkHeight}px` }" />
    </Drawer>

    <Modal :visible="!!dialogForExport" :width="1000" @closed="closeExportDialog()">
      <ExportDialog />
    </Modal>

    <Modal
      :visible="showAIPPTDialog"
      :width="840"
      :closeOnClickMask="false"
      :closeOnEsc="false"
      closeButton
      @closed="closeAIPPTDialog()"
    >
      <AIPPTDialog />
    </Modal>
  </template>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useMainStore, useSlidesStore, useContainerStore } from '@/store';
import useGlobalHotkey from '@/hooks/useGlobalHotkey';
import usePasteEvent from '@/hooks/usePasteEvent';
import useSlideEditLock from '@/hooks/useSlideEditLock';
import message from '@/utils/message';
import { ToolbarStates } from '@/types/toolbar';

import EditorHeader from './EditorHeader/index.vue';
import Canvas from './Canvas/index.vue';
import CanvasTool from './CanvasTool/index.vue';
import Thumbnails from './Thumbnails/index.vue';
import Toolbar from './Toolbar/index.vue';
import Remark from './Remark/index.vue';
import ExportDialog from './ExportDialog/index.vue';
import SelectPanel from './SelectPanel.vue';
import SearchPanel from './SearchPanel.vue';
import NotesPanel from './NotesPanel.vue';
import MarkupPanel from './MarkupPanel.vue';
import AIPPTDialog from './AIPPTDialog.vue';
import Modal from '@/components/Modal.vue';
import Drawer from '@/components/Drawer.vue';

const mainStore = useMainStore();
const slidesStore = useSlidesStore();
const containerStore = useContainerStore();
const { mode } = storeToRefs(containerStore);
const {
  dialogForExport,
  showSelectPanel,
  showSearchPanel,
  showNotesPanel,
  showMarkupPanel,
  showAIPPTDialog,
} = storeToRefs(mainStore);
const { currentSlide } = storeToRefs(slidesStore);
const {
  isCurrentSlideLocked,
  hasLockedSlides,
  confirmCurrentTemplate: confirmTemplate,
  confirmAllTemplates: confirmAll,
} = useSlideEditLock();

const closeExportDialog = () => mainStore.setDialogForExport('');
const closeAIPPTDialog = () => mainStore.setAIPPTDialogState(false);

const remarkHeight = ref(240);
const showRemarkDrawer = ref(false);
const showConfirmAllButton = ref(false);

// Mobile panel toggle state
const showLeftOnMobile = ref(false);
const showRightOnMobile = ref(false);

const toggleLeftPanel = () => {
  showLeftOnMobile.value = !showLeftOnMobile.value;
  if (showLeftOnMobile.value) {
    showRightOnMobile.value = false;
  }
};

const toggleRightPanel = () => {
  showRightOnMobile.value = !showRightOnMobile.value;
  if (showRightOnMobile.value) {
    showLeftOnMobile.value = false;
  }
};

// Function to open the drawer for editing
const openRemarkDrawer = () => {
  showRemarkDrawer.value = true;
};

// Function to confirm template from banner
const confirmCurrentTemplate = () => {
  confirmTemplate();
  mainStore.setToolbarState(ToolbarStates.SLIDE_DESIGN);
  message.success('Template confirmed! You can now edit your slide.');
};

// Function to show confirm all button (first step)
const promptConfirmAll = () => {
  showConfirmAllButton.value = true;
  // Auto-hide after 5 seconds
  setTimeout(() => {
    showConfirmAllButton.value = false;
  }, 5000);
};

// Function to confirm all templates (second step)
const confirmAllTemplates = () => {
  const confirmedCount = confirmAll();
  mainStore.setToolbarState(ToolbarStates.SLIDE_DESIGN);
  showConfirmAllButton.value = false;
  message.success(
    `Confirmed ${confirmedCount} slide${confirmedCount > 1 ? 's' : ''}! All slides are now editable.`
  );
};

useGlobalHotkey();
usePasteEvent();
</script>

<style lang="scss" scoped>
.pptist-editor {
  height: 100%;
}
.layout-header {
  height: 40px;
}
.layout-content {
  height: calc(100% - 40px);
  display: flex;
}
.layout-content-left {
  width: 180px;
  height: 100%;
  flex-shrink: 0;
}
.layout-content-center {
  width: calc(100% - 180px - 320px);
  height: 100%;
  display: flex;
  flex-direction: column;

  .center-top {
    height: 40px;
    flex-shrink: 0;
  }
  .center-body {
    flex: 1;
    min-height: 0;
  }
  .center-bottom {
    flex-shrink: 0;
    height: 45px;
    cursor: pointer;

    .remark-preview {
      height: 100%;
      border-top: 1px solid var(--presentation-border);
      padding: 8px 12px;
      background: var(--presentation-background);
      display: flex;
      align-items: center;
      justify-content: space-between;
      transition: background-color 0.2s;

      &:hover {
        background: rgba(0, 0, 0, 0.02);
      }

      .remark-content {
        flex: 1;
        font-size: 13px;
        line-height: 1.4;
        color: var(--presentation-foreground);
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        word-wrap: break-word;

        &.empty {
          color: #999;
          font-style: italic;
          display: block;
          -webkit-line-clamp: none;
          line-clamp: none;
        }
      }

      .remark-hint {
        font-size: 11px;
        color: #999;
        margin-left: 8px;
        white-space: nowrap;
      }
    }
  }
}
.layout-content-right {
  width: 320px;
  height: 100%;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .layout-content-right {
    width: 260px;
  }
  .layout-content-center {
    width: calc(100% - 180px - 260px);
  }
}

@media (max-width: 900px) {
  .layout-content-left,
  .layout-content-right {
    display: none;
  }

  .layout-content-center {
    width: 100%;
  }

  /* Mobile panel toggles */
  .center-top-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 8px;
  }

  .mobile-panel-toggle {
    display: flex;
    gap: 8px;
  }

  .mobile-toggle-btn {
    background: transparent;
    border: 1px solid rgba(0, 0, 0, 0.08);
    padding: 6px 8px;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
  }

  /* When toggled, show as overlays */
  .pptist-editor.show-left .layout-content-left,
  .pptist-editor.show-right .layout-content-right {
    display: block;
    position: absolute;
    top: 40px;
    bottom: 0;
    z-index: 30;
    background: var(--presentation-background);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  .pptist-editor.show-left .layout-content-left {
    left: 0;
    width: 240px;
  }

  .pptist-editor.show-right .layout-content-right {
    right: 0;
    width: 320px;
  }

  /* Banner responsive wrap */
  .preview-mode-banner .banner-content {
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .preview-mode-banner .banner-buttons {
    width: 100%;
    justify-content: flex-end;
  }

  .preview-mode-banner .banner-button {
    padding: 8px 12px;
    font-size: 12px;
  }

  .preview-mode-banner .banner-title {
    font-size: 13px;
  }

  .preview-mode-banner .banner-subtitle {
    display: none;
  }

  /* Hide remark preview on small screens */
  .center-bottom {
    display: none;
  }
}

/* Larger view mode adjustments */
.pptist-editor.view-mode {
  .layout-content-center {
    width: calc(100% - 180px);
  }
}

@media (max-width: 420px) {
  .mobile-toggle-btn {
    padding: 6px;
    font-size: 14px;
  }

  .preview-mode-banner .banner-icon {
    width: 28px;
    height: 28px;
  }
}

@keyframes pulse-glow {
  0%,
  100% {
    box-shadow: 0 0 8px rgba(251, 191, 36, 0.6);
  }
  50% {
    box-shadow: 0 0 16px rgba(251, 191, 36, 0.9);
  }
}
</style>
