<template>
  <div class="pptist-editor">
    <EditorHeader class="layout-header" />
    <div class="layout-content">
      <Thumbnails class="layout-content-left" />
      <div class="layout-content-center">
        <CanvasTool class="center-top" />
        <Canvas class="center-body" />
        <div class="center-bottom" @click="openRemarkDrawer">
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
      <Toolbar class="layout-content-right" />
    </div>
  </div>

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

  <Modal :visible="!!dialogForExport" :width="800" @closed="closeExportDialog()">
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

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useMainStore, useSlidesStore } from '@/store';
import useGlobalHotkey from '@/hooks/useGlobalHotkey';
import usePasteEvent from '@/hooks/usePasteEvent';

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
import type { SlideTheme } from '@/types/slides';

const mainStore = useMainStore();
const slidesStore = useSlidesStore();
const {
  dialogForExport,
  showSelectPanel,
  showSearchPanel,
  showNotesPanel,
  showMarkupPanel,
  showAIPPTDialog,
} = storeToRefs(mainStore);
const { currentSlide } = storeToRefs(slidesStore);
const closeExportDialog = () => mainStore.setDialogForExport('');
const closeAIPPTDialog = () => mainStore.setAIPPTDialogState(false);

const remarkHeight = ref(240);
const showRemarkDrawer = ref(false);

// Function to open the drawer for editing
const openRemarkDrawer = () => {
  showRemarkDrawer.value = true;
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
</style>
