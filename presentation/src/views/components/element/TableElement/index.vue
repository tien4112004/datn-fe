<template>
  <div
    class="editable-element-table"
    ref="elementRef"
    :class="{ lock: elementInfo.lock }"
    :style="{
      top: elementInfo.top + 'px',
      left: elementInfo.left + 'px',
      width: elementInfo.width + 'px',
    }"
  >
    <div class="rotate-wrapper" :style="{ transform: `rotate(${elementInfo.rotate}deg)` }">
      <div class="element-content" v-contextmenu="contextmenus">
        <EditableTable
          @mousedown.stop
          :data="elementInfo.data"
          :width="elementInfo.width"
          :cellMinHeight="elementInfo.cellMinHeight"
          :colWidths="elementInfo.colWidths"
          :outline="elementInfo.outline"
          :theme="elementInfo.theme"
          :editable="editable"
          @change="(data) => updateTableCells(data)"
          @changeColWidths="(widths) => updateColWidths(widths)"
          @changeSelectedCells="(cells) => updateSelectedCells(cells)"
        />
        <div
          class="table-mask"
          :class="{ lock: elementInfo.lock }"
          v-if="!editable || elementInfo.lock"
          @dblclick="startEdit()"
          @mousedown="($event) => handleSelectElement($event)"
          @touchstart="($event) => handleSelectElement($event)"
        >
          <div
            class="mask-tip"
            v-if="handleElementId === elementInfo.id"
            :style="{ transform: `scale(${1 / canvasScale})` }"
          >
            {{ $t('elements.table.interaction.doubleClickToEdit') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useMainStore, useSlidesStore } from '@/store';
import type { PPTTableElement, TableCell } from '@/types/slides';
import type { ContextmenuItem } from '@/components/Contextmenu/types';
import useHistorySnapshot from '@/hooks/useHistorySnapshot';

import EditableTable from './EditableTable.vue';

const props = defineProps<{
  elementInfo: PPTTableElement;
  selectElement: (e: MouseEvent | TouchEvent, element: PPTTableElement, canMove?: boolean) => void;
  contextmenus: () => ContextmenuItem[] | null;
}>();

const mainStore = useMainStore();
const slidesStore = useSlidesStore();
const { canvasScale, handleElementId, isScaling } = storeToRefs(mainStore);

const elementRef = ref<HTMLElement>();

const { addHistorySnapshot } = useHistorySnapshot();

const handleSelectElement = (e: MouseEvent | TouchEvent) => {
  if (props.elementInfo.lock) return;
  e.stopPropagation();

  props.selectElement(e, props.elementInfo);
};

// Update the table’s editable state; global shortcuts should be disabled while editing
const editable = ref(false);

watch(handleElementId, () => {
  if (handleElementId.value !== props.elementInfo.id) editable.value = false;
});

watch(editable, () => {
  mainStore.setDisableHotkeysState(editable.value);
});

const startEdit = () => {
  if (!props.elementInfo.lock) editable.value = true;
};

// Watch for changes in the table element’s size; when height changes, update it in Vuex
// If height changes during a resize operation, wait until resizing ends before updating
const realHeightCache = ref(-1);

watch(isScaling, () => {
  if (handleElementId.value !== props.elementInfo.id) return;

  if (isScaling.value) editable.value = false;

  if (!isScaling.value && realHeightCache.value !== -1) {
    slidesStore.updateElement({
      id: props.elementInfo.id,
      props: { height: realHeightCache.value },
    });
    realHeightCache.value = -1;
  }
});

const updateTableElementHeight = (entries: ResizeObserverEntry[]) => {
  const contentRect = entries[0].contentRect;
  if (!elementRef.value) return;

  const realHeight = contentRect.height;

  if (props.elementInfo.height !== realHeight) {
    if (!isScaling.value) {
      slidesStore.updateElement({
        id: props.elementInfo.id,
        props: { height: realHeight },
      });
    } else realHeightCache.value = realHeight;
  }
};

const resizeObserver = new ResizeObserver(updateTableElementHeight);

onMounted(() => {
  if (elementRef.value) resizeObserver.observe(elementRef.value);
});
onUnmounted(() => {
  if (elementRef.value) resizeObserver.unobserve(elementRef.value);
});

// Update table content data
const updateTableCells = (data: TableCell[][]) => {
  slidesStore.updateElement({
    id: props.elementInfo.id,
    props: { data },
  });
  addHistorySnapshot();
};

// Update the table's column width data
const updateColWidths = (widths: number[]) => {
  const width = widths.reduce((a, b) => a + b);
  const colWidths = widths.map((item) => item / width);

  slidesStore.updateElement({
    id: props.elementInfo.id,
    props: { width, colWidths },
  });
  addHistorySnapshot();
};

// Update the currently selected table cell
const updateSelectedCells = (cells: string[]) => {
  nextTick(() => mainStore.setSelectedTableCells(cells));
};
</script>

<style lang="scss" scoped>
.editable-element-table {
  position: absolute;

  &.lock .element-content {
    cursor: default;
  }
}
.rotate-wrapper {
  width: 100%;
  height: 100%;
}
.element-content {
  width: 100%;
  height: 100%;
  position: relative;
  cursor: move;
}
.table-mask {
  @include absolute-0();

  opacity: 0;
  transition: opacity 0.2s;

  .mask-tip {
    position: absolute;
    top: 5px;
    left: 5px;
    background-color: rgb(from var(--foreground) r g b / 0.5);
    color: var(--background);
    padding: 6px 12px;
    font-size: 0.75rem;
    transform-origin: 0 0;
  }

  &:hover:not(.lock) {
    opacity: 0.9;
  }
}
</style>
