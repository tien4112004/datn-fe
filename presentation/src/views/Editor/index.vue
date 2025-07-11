<template>
  <div class="pptist-editor">
    <EditorHeader class="layout-header" />
    <div class="layout-content">
      <Thumbnails class="layout-content-left" />
      <div class="layout-content-center">
        <CanvasTool class="center-top" />
        <Canvas class="center-body" />
        <Remark
          class="center-bottom"
          v-model:height="remarkHeight"
          :style="{ height: `${remarkHeight}px` }"
        />
      </div>
      <Toolbar class="layout-content-right" />
    </div>
  </div>

  <SelectPanel v-if="showSelectPanel" />
  <SearchPanel v-if="showSearchPanel" />
  <NotesPanel v-if="showNotesPanel" />
  <MarkupPanel v-if="showMarkupPanel" />

  <Modal :visible="!!dialogForExport" :width="680" @closed="closeExportDialog()">
    <ExportDialog />
  </Modal>

  <Modal
    :visible="showAIPPTDialog"
    :width="720"
    :closeOnClickMask="false"
    :closeOnEsc="false"
    closeButton
    @closed="closeAIPPTDialog()"
  >
    <AIPPTDialog />
  </Modal>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useMainStore } from '@/store';
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

const mainStore = useMainStore();
const {
  dialogForExport,
  showSelectPanel,
  showSearchPanel,
  showNotesPanel,
  showMarkupPanel,
  showAIPPTDialog,
} = storeToRefs(mainStore);
const closeExportDialog = () => mainStore.setDialogForExport('');
const closeAIPPTDialog = () => mainStore.setAIPPTDialogState(false);

const remarkHeight = ref(45);

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
  }
}
.layout-content-right {
  width: 320px;
  height: 100%;
}
</style>
