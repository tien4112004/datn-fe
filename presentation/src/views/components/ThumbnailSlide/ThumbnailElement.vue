<template>
  <div
    class="base-element"
    :class="`base-element-${elementInfo.id}`"
    :style="{
      zIndex: elementIndex,
    }"
  >
    <component :is="currentElementComponent" :elementInfo="elementInfo" target="thumbnail"></component>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { ELEMENT_TYPES, type PPTElement } from '@/types/slides';

import BaseImageElement from '@/views/components/element/ImageElement/BaseImageElement.vue';
import BaseTextElement from '@/views/components/element/TextElement/BaseTextElement.vue';
import BaseShapeElement from '@/views/components/element/ShapeElement/BaseShapeElement.vue';
import BaseLineElement from '@/views/components/element/LineElement/BaseLineElement.vue';
import BaseChartElement from '@/views/components/element/ChartElement/BaseChartElement.vue';
import BaseTableElement from '@/views/components/element/TableElement/BaseTableElement.vue';
import BaseLatexElement from '@/views/components/element/LatexElement/BaseLatexElement.vue';
import BaseVideoElement from '@/views/components/element/VideoElement/BaseVideoElement.vue';
import BaseAudioElement from '@/views/components/element/AudioElement/BaseAudioElement.vue';

const props = defineProps<{
  elementInfo: PPTElement;
  elementIndex: number;
}>();

const currentElementComponent = computed<unknown>(() => {
  const elementTypeMap = {
    [ELEMENT_TYPES.IMAGE]: BaseImageElement,
    [ELEMENT_TYPES.IMAGE.toUpperCase()]: BaseImageElement,
    [ELEMENT_TYPES.TEXT]: BaseTextElement,
    [ELEMENT_TYPES.TEXT.toUpperCase()]: BaseTextElement,
    [ELEMENT_TYPES.SHAPE]: BaseShapeElement,
    [ELEMENT_TYPES.SHAPE.toUpperCase()]: BaseShapeElement,
    [ELEMENT_TYPES.LINE]: BaseLineElement,
    [ELEMENT_TYPES.LINE.toUpperCase()]: BaseLineElement,
    [ELEMENT_TYPES.CHART]: BaseChartElement,
    [ELEMENT_TYPES.CHART.toUpperCase()]: BaseChartElement,
    [ELEMENT_TYPES.TABLE]: BaseTableElement,
    [ELEMENT_TYPES.TABLE.toUpperCase()]: BaseTableElement,
    [ELEMENT_TYPES.LATEX]: BaseLatexElement,
    [ELEMENT_TYPES.LATEX.toUpperCase()]: BaseLatexElement,
    [ELEMENT_TYPES.VIDEO]: BaseVideoElement,
    [ELEMENT_TYPES.VIDEO.toUpperCase()]: BaseVideoElement,
    [ELEMENT_TYPES.AUDIO]: BaseAudioElement,
    [ELEMENT_TYPES.AUDIO.toUpperCase()]: BaseAudioElement,
  };
  return elementTypeMap[props.elementInfo.type] || null;
});
</script>
