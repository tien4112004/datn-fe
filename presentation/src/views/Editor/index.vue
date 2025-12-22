<template>
  <div class="pptist-editor" :class="{ 'view-mode': mode === 'view' }">
    <EditorHeader class="layout-header" />
    <div class="layout-content">
      <Thumbnails class="layout-content-left layout-thumbnails" />
      <div class="layout-content-center">
        <CanvasTool v-if="mode === 'edit'" class="center-top" />

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
import { ref, computed, inject } from 'vue';
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

// Inject save function provided by RemoteApp (undefined if not in remote context)
const savePresentationFn = inject<(() => Promise<void>) | undefined>('savePresentationFn', undefined);

useGlobalHotkey(savePresentationFn);
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
  position: relative;
}
.layout-content-left {
  width: var(--thumbnails-width, 180px);
  height: 100%;
  flex-shrink: 0;
  z-index: 1;
}
.layout-content-center {
  flex: 1;
  min-width: 0;
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
  width: var(--toolbar-width, 320px);
  flex-shrink: 0;
  height: 100%;
}

.preview-mode-banner {
  flex-shrink: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 12px 16px;
  color: white;

  .banner-content {
    display: flex;
    align-items: center;
    gap: 12px;
    max-width: 100%;
    min-height: 40px;
    flex-wrap: wrap;
  }

  .banner-icon {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 8px;
  }

  .banner-text {
    flex: 1;
    min-width: 200px;
  }

  .banner-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 2px;
  }

  .banner-subtitle {
    font-size: 12px;
    opacity: 0.9;
    line-height: 1.4;
  }

  .banner-buttons {
    flex-shrink: 0;
    display: flex;
    gap: 8px;
  }

  .banner-button {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: white;
    color: #667eea;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;

    &:hover {
      background: rgba(255, 255, 255, 0.95);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    &:active {
      transform: translateY(0);
    }

    &.banner-button-secondary {
      background: rgba(255, 255, 255, 0.15);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.4);

      &:hover {
        background: rgba(255, 255, 255, 0.25);
        border-color: rgba(255, 255, 255, 0.6);
      }
    }

    &.banner-button-confirm {
      background: #fca43f;
      color: #92400e;
      border: 2px solid #f59e0b;
      animation: pulse-glow 1.5s ease-in-out infinite;

      &:hover {
        background: #fac822;
        border-color: #d97706;
        transform: translateY(-1px) scale(1.02);
      }
    }
  }
}

.pptist-editor.view-mode {
  .layout-content-center {
    flex: 1;
    min-width: 0;
  }

  @media (max-width: 1200px) {
    .layout-content-center {
      height: calc(100% - 100px) !important;
    }

    .layout-content-right {
      height: calc(100% - 100px) !important;
    }
  }
}

// Responsive styles for smaller PC screens
@media (max-width: 1366px) {
  .preview-mode-banner {
    padding: 10px 12px;

    .banner-icon {
      width: 32px;
      height: 32px;
    }

    .banner-title {
      font-size: 13px;
    }

    .banner-subtitle {
      font-size: 11px;
    }

    .banner-button {
      padding: 6px 10px;
      font-size: 12px;
      gap: 4px;
    }
  }
}

@media (max-width: 1200px) {
  .preview-mode-banner {
    padding: 8px 10px;

    .banner-content {
      gap: 8px;
      flex-wrap: wrap;
      min-height: auto;
    }

    .banner-icon {
      width: 28px;
      height: 28px;
      order: 1;
    }

    .banner-text {
      min-width: 150px;
      flex-basis: 100%;
      order: 2;
      margin-top: 4px;
    }

    .banner-title {
      font-size: 12px;
      margin-bottom: 1px;
    }

    .banner-subtitle {
      font-size: 10px;
    }

    .banner-button {
      padding: 5px 8px;
      font-size: 11px;
    }

    .banner-buttons {
      order: 3;
      margin-top: 4px;
      flex-wrap: wrap;
    }
  }

  .layout-content-center {
    .center-bottom {
      height: 40px;

      .remark-preview {
        padding: 6px 10px;

        .remark-content {
          font-size: 12px;
        }

        .remark-hint {
          font-size: 10px;
        }
      }
    }
  }

  // Reposition thumbnails to bottom with horizontal layout
  .layout-content {
    flex-wrap: wrap;
  }

  .layout-thumbnails {
    order: 3;
    flex-basis: 100%;
    width: 100% !important;
    height: 100px !important;
    border-top: 1px solid var(--presentation-border);
    border-left: none;
    z-index: 10; // Above drawer backdrop but below drawer
  }

  .layout-content-center {
    order: 1;
    flex: 1 1 0;
    min-width: 0;
    height: calc(100% - 100px) !important;
  }

  .layout-content-right {
    order: 2;
    flex-shrink: 0;
    height: calc(100% - 100px) !important;
  }
}

// Ensure drawer appears above thumbnails
:deep(.drawer-wrapper) {
  z-index: 100 !important;
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
