<template>
  <Card class="canvas-tool" padding="none">
    <div class="left-handler">
      <div
        class="handler-item"
        :class="{ disable: !canUndo }"
        v-tooltip="$t('ui.actions.undo')"
        @click="undo()"
      >
        <IconBack />
      </div>
      <div
        class="handler-item"
        :class="{ disable: !canRedo }"
        v-tooltip="$t('ui.actions.redo')"
        @click="redo()"
      >
        <IconNext />
      </div>
      <div class="more">
        <Divider type="vertical" style="height: 20px" class="divider1" />
        <Popover class="more-icon" trigger="click" v-model:value="moreVisible" :offset="10">
          <template #content>
            <PopoverMenuItem
              center
              @click="
                toggleNotesPanel();
                moreVisible = false;
              "
              >{{ $t('toolbar.panels.annotationPanel') }}</PopoverMenuItem
            >
            <PopoverMenuItem
              center
              @click="
                toggleSelectPanel();
                moreVisible = false;
              "
              >{{ $t('toolbar.panels.selectionPane') }}</PopoverMenuItem
            >
            <PopoverMenuItem
              center
              @click="
                toggleSraechPanel();
                moreVisible = false;
              "
              >{{ $t('toolbar.panels.findAndReplace') }}</PopoverMenuItem
            >
          </template>
          <div class="handler-item">
            <IconMore />
          </div>
        </Popover>
        <div
          class="handler-item"
          :class="{ active: showNotesPanel }"
          v-tooltip="$t('toolbar.panels.annotationPanel')"
          @click="toggleNotesPanel()"
        >
          <IconComment />
        </div>
        <div
          class="handler-item"
          :class="{ active: showSelectPanel }"
          v-tooltip="$t('toolbar.panels.selectionPane')"
          @click="toggleSelectPanel()"
        >
          <IconMoveOne />
        </div>
        <div
          class="handler-item"
          :class="{ active: showSearchPanel }"
          v-tooltip="$t('toolbar.panels.findAndReplace')"
          @click="toggleSraechPanel()"
        >
          <IconSearch />
        </div>
      </div>
    </div>

    <div class="add-element-handler">
      <div class="group-btn" v-tooltip="$t('toolbar.tools.insertText')">
        <div class="handler-item" @click="drawText()">
          <IconFontSize class="icon" :class="{ active: creatingElement?.type === 'text' }" />
        </div>

        <Popover trigger="click" v-model:value="textTypeSelectVisible" style="height: 100%" :offset="10">
          <template #content>
            <PopoverMenuItem
              center
              @click="
                () => {
                  drawText();
                  textTypeSelectVisible = false;
                }
              "
            >
              <IconTextRotationNone style="margin-right: 2px" />
              {{ $t('toolbar.tools.horizontalTextBox') }}
            </PopoverMenuItem>
            <PopoverMenuItem
              center
              @click="
                () => {
                  drawText(true);
                  textTypeSelectVisible = false;
                }
              "
            >
              <IconTextRotationDown style="margin-right: 2px" />
              {{ $t('toolbar.tools.verticalTextBox') }}
            </PopoverMenuItem>
          </template>
          <div class="handler-item">
            <IconDown class="arrow" />
          </div>
        </Popover>
      </div>
      <div class="group-btn" v-tooltip="$t('toolbar.tools.insertShape')" :offset="10">
        <Popover trigger="click" style="height: 100%" v-model:value="shapePoolVisible" :offset="10">
          <template #content>
            <ShapePool @select="(shape) => drawShape(shape)" />
          </template>
          <div class="handler-item">
            <IconGraphicDesign
              class="icon"
              :class="{ active: creatingCustomShape || creatingElement?.type === 'shape' }"
            />
          </div>
        </Popover>

        <Popover trigger="click" v-model:value="shapeMenuVisible" style="height: 100%" :offset="10">
          <template #content>
            <PopoverMenuItem
              center
              @click="
                shapeMenuVisible = false;
                shapePoolVisible = true;
              "
              ><IconGraphicDesign class="icon" /> {{ $t('toolbar.tools.presetShapes') }}</PopoverMenuItem
            >
            <PopoverMenuItem
              center
              @click="
                () => {
                  drawCustomShape();
                  shapeMenuVisible = false;
                }
              "
              ><IconWritingFluently class="icon" /> {{ $t('toolbar.tools.freehandDrawing') }}</PopoverMenuItem
            >
          </template>
          <div class="handler-item">
            <IconDown class="arrow" />
          </div>
        </Popover>
      </div>
      <div class="group-btn" v-tooltip="$t('toolbar.tools.insertImage')">
        <FileInput style="height: 100%" @change="(files) => insertImageElement(files)">
          <div class="handler-item">
            <IconPicture class="icon" />
          </div>
        </FileInput>

        <Popover trigger="click" v-model:value="imageMenuVisible" style="height: 100%" :offset="10">
          <template #content>
            <FileInput
              @change="
                (files) => {
                  insertImageElement(files);
                  imageMenuVisible = false;
                }
              "
            >
              <PopoverMenuItem center
                ><IconUpload class="icon" /> {{ $t('toolbar.tools.uploadImage') }}</PopoverMenuItem
              >
            </FileInput>
            <PopoverMenuItem
              center
              @click="
                openImageLibPanel();
                imageMenuVisible = false;
              "
              ><IconPicture class="icon" /> {{ $t('toolbar.tools.onlineLibrary') }}</PopoverMenuItem
            >
          </template>
          <div class="handler-item">
            <IconDown class="arrow" />
          </div>
        </Popover>
      </div>
      <Popover trigger="click" v-model:value="linePoolVisible" :offset="10">
        <template #content>
          <LinePool @select="(line) => drawLine(line)" />
        </template>
        <div
          class="handler-item"
          :class="{ active: creatingElement?.type === 'line' }"
          v-tooltip="$t('toolbar.tools.insertLine')"
        >
          <IconConnection />
        </div>
      </Popover>
      <Popover trigger="click" v-model:value="chartPoolVisible" :offset="10">
        <template #content>
          <ChartPool
            @select="
              (chart) => {
                createChartElement(chart);
                chartPoolVisible = false;
              }
            "
          />
        </template>
        <div class="handler-item" v-tooltip="$t('toolbar.tools.insertChart')">
          <IconChartProportion />
        </div>
      </Popover>
      <Popover trigger="click" v-model:value="tableGeneratorVisible" :offset="10">
        <template #content>
          <TableGenerator
            @close="tableGeneratorVisible = false"
            @insert="
              ({ row, col }) => {
                createTableElement(row, col);
                tableGeneratorVisible = false;
              }
            "
          />
        </template>
        <div class="handler-item" v-tooltip="$t('toolbar.tools.insertTable')">
          <IconInsertTable />
        </div>
      </Popover>
      <div
        class="handler-item"
        v-tooltip="$t('toolbar.tools.insertFormula')"
        @click="latexEditorVisible = true"
      >
        <IconFormula />
      </div>
      <Popover trigger="click" v-model:value="mediaInputVisible" :offset="10">
        <template #content>
          <MediaInput
            @close="mediaInputVisible = false"
            @insertVideo="
              ({ src, ext }) => {
                createVideoElement(src, ext);
                mediaInputVisible = false;
              }
            "
            @insertAudio="
              ({ src, ext }) => {
                createAudioElement(src, ext);
                mediaInputVisible = false;
              }
            "
          />
        </template>
        <div class="handler-item" v-tooltip="$t('toolbar.tools.insertAudioVideo')">
          <IconVideoTwo />
        </div>
      </Popover>
    </div>

    <div class="right-handler">
      <div
        class="handler-item viewport-size"
        v-tooltip="$t('canvas.controls.zoomOut')"
        @click="scaleCanvas('-')"
      >
        <IconMinus />
      </div>
      <Popover trigger="click" v-model:value="canvasScaleVisible">
        <template #content>
          <PopoverMenuItem
            center
            v-for="item in canvasScalePresetList"
            :key="item"
            @click="applyCanvasPresetScale(item)"
            >{{ item }}%</PopoverMenuItem
          >
          <PopoverMenuItem
            center
            @click="
              resetCanvas();
              canvasScaleVisible = false;
            "
            >{{ $t('ui.layout.fitToScreen') }}</PopoverMenuItem
          >
        </template>
        <span class="text">{{ canvasScalePercentage }}</span>
      </Popover>
      <div
        class="handler-item viewport-size"
        v-tooltip="$t('canvas.controls.zoomIn')"
        @click="scaleCanvas('+')"
      >
        <IconPlus />
      </div>
      <div
        class="handler-item viewport-size-adaptation"
        v-tooltip="$t('canvas.controls.fitToScreen')"
        @click="resetCanvas()"
      >
        <IconFullScreenOne />
      </div>
    </div>

    <Modal v-model:visible="latexEditorVisible" :width="920">
      <LaTeXEditor
        @close="latexEditorVisible = false"
        @update="
          (data) => {
            createLatexElement(data);
            latexEditorVisible = false;
          }
        "
      />
    </Modal>
  </Card>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useMainStore, useSnapshotStore } from '@/store';
import { getImageDataURL } from '@/utils/image';
import type { ShapePoolItem } from '@/configs/shapes';
import type { LinePoolItem } from '@/configs/lines';
import useScaleCanvas from '@/hooks/useScaleCanvas';
import useHistorySnapshot from '@/hooks/useHistorySnapshot';
import useCreateElement from '@/hooks/useCreateElement';

import ShapePool from './ShapePool.vue';
import LinePool from './LinePool.vue';
import ChartPool from './ChartPool.vue';
import TableGenerator from './TableGenerator.vue';
import MediaInput from './MediaInput.vue';
import LaTeXEditor from '@/components/LaTeXEditor/index.vue';
import FileInput from '@/components/FileInput.vue';
import Modal from '@/components/Modal.vue';
import Divider from '@/components/Divider.vue';
import Popover from '@/components/Popover.vue';
import PopoverMenuItem from '@/components/PopoverMenuItem.vue';
import Card from '@/components/Card.vue';

const mainStore = useMainStore();
const {
  creatingElement,
  creatingCustomShape,
  showSelectPanel,
  showSearchPanel,
  showNotesPanel,
  showSymbolPanel,
} = storeToRefs(mainStore);
const { canUndo, canRedo } = storeToRefs(useSnapshotStore());

const { redo, undo } = useHistorySnapshot();

const { scaleCanvas, setCanvasScalePercentage, resetCanvas, canvasScalePercentage } = useScaleCanvas();

const canvasScalePresetList = [200, 150, 125, 100, 75, 50];
const canvasScaleVisible = ref(false);

const applyCanvasPresetScale = (value: number) => {
  setCanvasScalePercentage(value);
  canvasScaleVisible.value = false;
};

const {
  createImageElement,
  createChartElement,
  createTableElement,
  createLatexElement,
  createVideoElement,
  createAudioElement,
} = useCreateElement();

const insertImageElement = (files: FileList) => {
  const imageFile = files[0];
  if (!imageFile) return;
  getImageDataURL(imageFile).then((dataURL) => createImageElement(dataURL));
};

const shapePoolVisible = ref(false);
const linePoolVisible = ref(false);
const chartPoolVisible = ref(false);
const tableGeneratorVisible = ref(false);
const mediaInputVisible = ref(false);
const latexEditorVisible = ref(false);
const textTypeSelectVisible = ref(false);
const shapeMenuVisible = ref(false);
const imageMenuVisible = ref(false);
const moreVisible = ref(false);

// Insert text
const drawText = (vertical = false) => {
  mainStore.setCreatingElement({
    type: 'text',
    vertical,
  });
};

// Insert shape
const drawShape = (shape: ShapePoolItem) => {
  mainStore.setCreatingElement({
    type: 'shape',
    data: shape,
  });
  shapePoolVisible.value = false;
};
// Draw custom arbitrary polygon
const drawCustomShape = () => {
  mainStore.setCreatingCustomShapeState(true);
  shapePoolVisible.value = false;
};

// Draw line path
const drawLine = (line: LinePoolItem) => {
  mainStore.setCreatingElement({
    type: 'line',
    data: line,
  });
  linePoolVisible.value = false;
};

// Open selection panel
const toggleSelectPanel = () => {
  mainStore.setSelectPanelState(!showSelectPanel.value);
};

// Open search and replace panel
const toggleSraechPanel = () => {
  mainStore.setSearchPanelState(!showSearchPanel.value);
};

// Open annotation panel
const toggleNotesPanel = () => {
  mainStore.setNotesPanelState(!showNotesPanel.value);
};

// Open image library panel
const openImageLibPanel = () => {
  mainStore.setImageLibPanelState(true);
};
</script>

<style lang="scss" scoped>
.canvas-tool {
  position: relative;
  font-size: 0.875rem;
  margin: 4px 16px;
  display: flex;
  font-size: 0.875rem;

  :deep(.card-content) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-inline: 1rem;
  }
}
.left-handler,
.more {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  gap: 2px;
}
.left-handler {
  min-width: 0;
  gap: 2px;
}
.more-icon {
  display: none;
}
.add-element-handler {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;

  .group-btn {
    display: flex;
    width: auto;
    margin-right: 0;
    flex-shrink: 0;
    padding: 0 4px;
    border-radius: var(--presentation-radius);

    .handler-item {
      width: 24px;
      padding: 0;

      .active {
        color: var(--presentation-primary);
      }
    }

    &:hover {
      background-color: var(--presentation-card)-hover;
    }

    .icon,
    .arrow {
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .arrow {
      font-size: 12px;

      &:hover {
        background-color: #e9e9e9;
      }
    }
  }
}
.handler-item {
  width: 36px;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: var(--presentation-radius);
  overflow: hidden;
  cursor: pointer;
  padding: 0;

  &.disable {
    opacity: 0.5;
  }
}

.handler-item {
  &.active,
  &:not(.disable):hover {
    background-color: #f1f1f1;
  }
}

.right-handler {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  min-width: 0;
  gap: 4px;
  .text {
    display: inline-block;
    width: 40px;
    text-align: center;
    cursor: pointer;
  }

  .viewport-size {
    font-size: 0.875rem;
  }
}

@media screen and (width <= 1500px) {
  .right-handler .text {
    display: none;
  }
  .more > .handler-item {
    display: none;
  }
  .more-icon {
    display: block;
  }

  .more .divider1 {
    display: none;
  }
}

@media screen and (width <= 1400px) {
  .canvas-tool {
    :deep(.card-content) {
      padding-inline: 2px;
    }
  }
}

@media screen and (width <= 1300px) {
  .left-handler,
  .right-handler {
    display: none;
  }

  .canvas-tool {
    margin: 2px 8px;

    :deep(.card-content) {
      padding-inline: 0.25rem;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}
</style>
