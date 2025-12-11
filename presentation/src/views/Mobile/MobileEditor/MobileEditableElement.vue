<template>
  <div
    class="mobile-editable-element"
    :style="{
      zIndex: elementIndex,
    }"
  >
    <component
      :is="currentElementComponent"
      :elementInfo="elementInfo"
      :selectElement="selectElement"
      :contextmenus="() => null"
    ></component>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { ELEMENT_TYPES, type PPTElement } from '@/types/slides';

import ImageElement from '@/views/components/element/ImageElement/index.vue';
import TextElement from '@/views/components/element/TextElement/index.vue';
import ShapeElement from '@/views/components/element/ShapeElement/index.vue';
import LineElement from '@/views/components/element/LineElement/index.vue';
import ChartElement from '@/views/components/element/ChartElement/index.vue';
import TableElement from '@/views/components/element/TableElement/index.vue';
import LatexElement from '@/views/components/element/LatexElement/index.vue';
import VideoElement from '@/views/components/element/VideoElement/index.vue';
import AudioElement from '@/views/components/element/AudioElement/index.vue';

const props = defineProps<{
  elementInfo: PPTElement;
  elementIndex: number;
  selectElement: (e: TouchEvent, element: PPTElement, canMove?: boolean) => void;
}>();

const currentElementComponent = computed<unknown>(() => {
  const elementTypeMap = {
    [ELEMENT_TYPES.IMAGE]: ImageElement,
    [ELEMENT_TYPES.TEXT]: TextElement,
    [ELEMENT_TYPES.SHAPE]: ShapeElement,
    [ELEMENT_TYPES.LINE]: LineElement,
    [ELEMENT_TYPES.CHART]: ChartElement,
    [ELEMENT_TYPES.TABLE]: TableElement,
    [ELEMENT_TYPES.LATEX]: LatexElement,
    [ELEMENT_TYPES.VIDEO]: VideoElement,
    [ELEMENT_TYPES.AUDIO]: AudioElement,
  };
  return elementTypeMap[props.elementInfo.type] || null;
});
</script>
