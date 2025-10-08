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

      <div class="tw-flex tw-flex-col tw-gap-4 tw-w-16">
        <Button class="tw-text-wrap tw-h-24" @click="() => createSlide('title-with-subtitle')"
          >Title (with Subtitle)</Button
        >
        <Button class="tw-text-wrap tw-h-24" @click="() => createSlide('title-no-subtitle')"
          >Title (no Subtitle)</Button
        >
        <Button class="tw-text-wrap tw-h-24" @click="() => createSlide('two-column-with-image')"
          >Two Column with Image</Button
        >
        <Button class="tw-text-wrap tw-h-24" @click="() => createSlide('two-column')">Two Column</Button>
        <Button class="tw-text-wrap tw-h-24" @click="() => createSlide('main-image')">Main Image</Button>
        <Button class="tw-text-wrap tw-h-24" @click="() => createSlide('table-of-contents')"
          >Table of Contents</Button
        >
        <Button class="tw-text-wrap tw-h-24" @click="() => createSlide('vertical-list')"
          >Vertical List</Button
        >
        <Button class="tw-text-wrap tw-h-24" @click="() => createSlide('horizontal-list')"
          >Horizontal List</Button
        >
      </div>
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
import { convertToSlide } from '@/utils/slideLayout';
import Button from '@/components/Button.vue';

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

const viewport = {
  width: 1000,
  height: 562.5,
};

const theme = {
  backgroundColor: {
    type: 'linear',
    colors: [
      { color: '#e3f2fd', pos: 0 }, // soft bluish tint
      { color: '#f5f7fa', pos: 50 }, // very light gray
      { color: '#ffffff', pos: 100 }, // pure white at top
    ],
    rotate: 0,
  },
  themeColors: ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'],
  fontColor: '#333333',
  fontName: 'Roboto',
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
  titleFontColor: '#0A2540',
  titleFontName: 'Roboto',
  labelFontColor: '#0A2540',
  labelFontName: 'Oswald',
} as SlideTheme;

slidesStore.setTheme(theme);

const slideTemplates: Record<string, any[]> = {
  'title-with-subtitle': Array(4).fill({
    type: 'title',
    data: {
      title: 'Presentation with really long title',
      subtitle:
        'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    },
  }),
  'title-no-subtitle': Array(4).fill({
    type: 'title',
    data: {
      title: 'Presentation with really long title',
    },
  }),
  'two-column-with-image': Array(6).fill({
    type: 'two_column_with_image',
    title: 'Presentation',
    data: {
      items: [
        'Item1: Lorem ipsum dolor sit amet, consectetur adipiscing elit. ',
        'Item2: Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        'Item3: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. ',
      ],
      image: 'https://placehold.co/600x400',
    },
  }),
  'two-column': Array(4).fill({
    type: 'two_column',
    title: 'this is a title',
    data: {
      items1: [
        'Item1-1: Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'Item1-2: Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'Item1-3: Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      ],
      items2: [
        'Item2-1: Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'Item2-2: Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'Item2-3: Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      ],
    },
  }),
  'main-image': Array(4).fill({
    type: 'main_image',
    data: {
      image: 'https://placehold.co/600x400',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    },
  }),
  'table-of-contents': [
    {
      type: 'table_of_contents',
      data: {
        items: [
          'Item1: What & Why of Microservices',
          'Item2: Monolith vs Microservices',
          'Item3: Service Design Principles',
          'Item4: Communication & Data',
          'Item5: Deployment & Scaling',
          'Item6: Observability & Resilience',
          'Item7: Security & Governance',
          'Item8: Case Study & Q&A',
        ],
      },
    },
  ],
  'vertical-list': Array(6).fill({
    type: 'vertical_list',
    title: 'This is a title',
    data: {
      items: [
        'Item1: Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'Item2: Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'Item3: Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'Item4: Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'Item5: Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'Item6: Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'Item7: Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      ],
    },
  }),
  'horizontal-list': Array(4).fill({
    type: 'horizontal_list',
    title: 'Five Fundamentals of Microservices',
    data: {
      items: [
        {
          label: 'Boundaries',
          content: 'Define services around business capabilities and domains.',
        },
        {
          label: 'APIs',
          content: 'Use clear contracts (REST/gRPC) and versioning.',
        },
        {
          label: 'Data',
          content: 'Own your data; avoid shared databases.',
        },
        {
          label: 'Delivery',
          content: 'Automate CI/CD per service for rapid iteration.',
        },
        {
          label: 'Observability',
          content: 'Centralize logs, metrics, and traces for each service.',
        },
      ],
    },
  }),
};

const createSlide = async (slideType: string) => {
  const slideData = slideTemplates[slideType];
  if (!slideData) {
    console.error(`Unknown slide type: ${slideType}`);
    return;
  }

  for (const data of slideData) {
    const slide = await convertToSlide(data, viewport, theme, undefined, '1');
    slidesStore.appendNewSlide(slide);
  }
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
