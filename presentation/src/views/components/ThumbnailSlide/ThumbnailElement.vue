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
import { ElementTypes, type PPTElement } from '@/types/slides';

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
    [ElementTypes.IMAGE]: BaseImageElement,
    [ElementTypes.IMAGE.toUpperCase()]: BaseImageElement,
    [ElementTypes.TEXT]: BaseTextElement,
    [ElementTypes.TEXT.toUpperCase()]: BaseTextElement,
    [ElementTypes.SHAPE]: BaseShapeElement,
    [ElementTypes.SHAPE.toUpperCase()]: BaseShapeElement,
    [ElementTypes.LINE]: BaseLineElement,
    [ElementTypes.LINE.toUpperCase()]: BaseLineElement,
    [ElementTypes.CHART]: BaseChartElement,
    [ElementTypes.CHART.toUpperCase()]: BaseChartElement,
    [ElementTypes.TABLE]: BaseTableElement,
    [ElementTypes.TABLE.toUpperCase()]: BaseTableElement,
    [ElementTypes.LATEX]: BaseLatexElement,
    [ElementTypes.LATEX.toUpperCase()]: BaseLatexElement,
    [ElementTypes.VIDEO]: BaseVideoElement,
    [ElementTypes.VIDEO.toUpperCase()]: BaseVideoElement,
    [ElementTypes.AUDIO]: BaseAudioElement,
    [ElementTypes.AUDIO.toUpperCase()]: BaseAudioElement,
  };
  return elementTypeMap[props.elementInfo.type] || null;
});
</script>
