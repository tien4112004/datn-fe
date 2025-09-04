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
      <Button @click="handleClick">Click Me</Button>T
    </div>
  </div>

  <SelectPanel v-if="showSelectPanel" />
  <SearchPanel v-if="showSearchPanel" />
  <NotesPanel v-if="showNotesPanel" />
  <MarkupPanel v-if="showMarkupPanel" />

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
import { ref } from 'vue';
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
import Button from '@/components/Button.vue';
import { convertToSlide } from '@/utils/slideLayout/slideLayoutConverter';
import type { SlideTheme } from '@/types/slides';
import { L } from 'vitest/dist/chunks/reporters.d.BFLkQcL6.js';

const mainStore = useMainStore();
const slideStore = useSlidesStore();
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
const appendNewSlide = slideStore.appendNewSlide;

const remarkHeight = ref(45);

useGlobalHotkey();
usePasteEvent();

const handleClick = () => {
  const dataTest1 = {
    type: 'two_column_with_image',
    title: 'Presentation',
    data: {
      items: [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ',
        'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. ',
        'item 3 here',
      ],
      image: 'https://placehold.co/600x400',
    },
  };

  const dataTest2 = {
    type: 'main_image',
    data: {
      image: 'https://placehold.co/600x400',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    },
  };

  const viewport = {
    size: slideStore.viewportSize,
    ratio: slideStore.viewportRatio,
  };

  const theme = {
    backgroundColor: '#ffffff',
    themeColors: ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'],
    fontColor: '#333333',
    fontName: 'Arial',
    outline: {
      style: 'solid',
      width: 1,
      color: '#cccccc',
    },
    shadow: {
      h: 2,
      v: 2,
      blur: 4,
      color: 'rgba(0, 0, 0, 0.1)',
    },
  } as SlideTheme;

  slideStore.setTheme(theme); // This should be set after initialization

  const slide1 = convertToSlide(dataTest1, viewport, theme);

  const slide2 = convertToSlide(dataTest2, viewport, theme);

  appendNewSlide(slide1);
  appendNewSlide(slide2);

  console.log(slideStore.slides);
};
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
