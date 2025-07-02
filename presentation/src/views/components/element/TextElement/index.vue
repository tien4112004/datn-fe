<template>
  <div
    class="editable-element-text"
    :class="{ lock: elementInfo.lock }"
    :style="{
      top: elementInfo.top + 'px',
      left: elementInfo.left + 'px',
      width: elementInfo.width + 'px',
      height: elementInfo.height + 'px',
    }"
  >
    <div class="rotate-wrapper" :style="{ transform: `rotate(${elementInfo.rotate}deg)` }">
      <div
        class="element-content"
        ref="elementRef"
        :style="{
          width: elementInfo.vertical ? 'auto' : elementInfo.width + 'px',
          height: elementInfo.vertical ? elementInfo.height + 'px' : 'auto',
          backgroundColor: elementInfo.fill,
          opacity: elementInfo.opacity,
          textShadow: shadowStyle,
          lineHeight: elementInfo.lineHeight,
          letterSpacing: (elementInfo.wordSpace || 0) + 'px',
          color: elementInfo.defaultColor,
          fontFamily: elementInfo.defaultFontName,
          writingMode: elementInfo.vertical ? 'vertical-rl' : 'horizontal-tb',
        }"
        v-contextmenu="contextmenus"
        @mousedown="($event) => handleSelectElement($event)"
        @touchstart="($event) => handleSelectElement($event)"
      >
        <ElementOutline
          :width="elementInfo.width"
          :height="elementInfo.height"
          :outline="elementInfo.outline"
        />
        <ProsemirrorEditor
          class="text"
          :elementId="elementInfo.id"
          :defaultColor="elementInfo.defaultColor"
          :defaultFontName="elementInfo.defaultFontName"
          :editable="!elementInfo.lock"
          :value="elementInfo.content"
          :style="{
            '--paragraphSpace': `${elementInfo.paragraphSpace === undefined ? 5 : elementInfo.paragraphSpace}px`,
          }"
          @update="({ value, ignore }) => updateContent(value, ignore)"
          @mousedown="($event) => handleSelectElement($event, false)"
        />

        <!-- When font size is too large and line height is too small, text height overflow may occur, causing the drag area to be unselectable, so the following nodes are added to avoid this situation -->
        <div class="drag-handler top"></div>
        <div class="drag-handler bottom"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { debounce } from 'lodash';
import { useMainStore, useSlidesStore } from '@/store';
import type { PPTTextElement } from '@/types/slides';
import type { ContextmenuItem } from '@/components/Contextmenu/types';
import useElementShadow from '@/views/components/element/hooks/useElementShadow';
import useHistorySnapshot from '@/hooks/useHistorySnapshot';

import ElementOutline from '@/views/components/element/ElementOutline.vue';
import ProsemirrorEditor from '@/views/components/element/ProsemirrorEditor.vue';

const props = defineProps<{
  elementInfo: PPTTextElement;
  selectElement: (e: MouseEvent | TouchEvent, element: PPTTextElement, canMove?: boolean) => void;
  contextmenus: () => ContextmenuItem[] | null;
}>();

const mainStore = useMainStore();
const slidesStore = useSlidesStore();
const { handleElementId, isScaling } = storeToRefs(mainStore);

const { addHistorySnapshot } = useHistorySnapshot();

const elementRef = ref<HTMLElement>();

const shadow = computed(() => props.elementInfo.shadow);
const { shadowStyle } = useElementShadow(shadow);

const handleSelectElement = (e: MouseEvent | TouchEvent, canMove = true) => {
  if (props.elementInfo.lock) return;
  e.stopPropagation();

  props.selectElement(e, props.elementInfo, canMove);
};

// Listen for text element size changes, update height to vuex when height changes
// If height changes during scaling operation, wait until scaling ends before updating
const realHeightCache = ref(-1);
const realWidthCache = ref(-1);

watch(isScaling, () => {
  if (handleElementId.value !== props.elementInfo.id) return;

  if (!isScaling.value) {
    if (!props.elementInfo.vertical && realHeightCache.value !== -1) {
      slidesStore.updateElement({
        id: props.elementInfo.id,
        props: { height: realHeightCache.value },
      });
      realHeightCache.value = -1;
    }
    if (props.elementInfo.vertical && realWidthCache.value !== -1) {
      slidesStore.updateElement({
        id: props.elementInfo.id,
        props: { width: realWidthCache.value },
      });
      realWidthCache.value = -1;
    }
  }
});

const updateTextElementHeight = (entries: ResizeObserverEntry[]) => {
  const contentRect = entries[0].contentRect;
  if (!elementRef.value) return;

  const realHeight = contentRect.height + 20;
  const realWidth = contentRect.width + 20;

  if (!props.elementInfo.vertical && props.elementInfo.height !== realHeight) {
    if (!isScaling.value) {
      slidesStore.updateElement({
        id: props.elementInfo.id,
        props: { height: realHeight },
      });
    } else realHeightCache.value = realHeight;
  }
  if (props.elementInfo.vertical && props.elementInfo.width !== realWidth) {
    if (!isScaling.value) {
      slidesStore.updateElement({
        id: props.elementInfo.id,
        props: { width: realWidth },
      });
    } else realWidthCache.value = realWidth;
  }
};
const resizeObserver = new ResizeObserver(updateTextElementHeight);

onMounted(() => {
  if (elementRef.value) resizeObserver.observe(elementRef.value);
});
onUnmounted(() => {
  if (elementRef.value) resizeObserver.unobserve(elementRef.value);
});

const updateContent = (content: string, ignore = false) => {
  slidesStore.updateElement({
    id: props.elementInfo.id,
    props: { content },
  });

  if (!ignore) addHistorySnapshot();
};

const checkEmptyText = debounce(
  function () {
    const pureText = props.elementInfo.content.replace(/<[^>]+>/g, '');
    if (!pureText) slidesStore.deleteElement(props.elementInfo.id);
  },
  300,
  { trailing: true }
);

const isHandleElement = computed(() => handleElementId.value === props.elementInfo.id);
watch(isHandleElement, () => {
  if (!isHandleElement.value) checkEmptyText();
});
</script>

<style lang="scss" scoped>
.editable-element-text {
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
  position: relative;
  padding: 10px;
  line-height: 1.5;
  word-break: break-word;
  cursor: move;

  .text {
    position: relative;
  }

  ::v-deep(a) {
    cursor: text;
  }
}
.drag-handler {
  height: 10px;
  position: absolute;
  left: 0;
  right: 0;

  &.top {
    top: 0;
  }
  &.bottom {
    bottom: 0;
  }
}
</style>
