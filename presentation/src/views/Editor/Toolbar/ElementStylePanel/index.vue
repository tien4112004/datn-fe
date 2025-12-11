<template>
  <div class="element-style-panel">
    <component :is="currentPanelComponent"></component>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useMainStore } from '@/store';
import { ELEMENT_TYPES } from '@/types/slides';

import TextStylePanel from './TextStylePanel.vue';
import ImageStylePanel from './ImageStylePanel.vue';
import ShapeStylePanel from './ShapeStylePanel.vue';
import LineStylePanel from './LineStylePanel.vue';
import ChartStylePanel from './ChartStylePanel/index.vue';
import TableStylePanel from './TableStylePanel.vue';
import LatexStylePanel from './LatexStylePanel.vue';
import VideoStylePanel from './VideoStylePanel.vue';
import AudioStylePanel from './AudioStylePanel.vue';

const panelMap = {
  [ELEMENT_TYPES.TEXT]: TextStylePanel,
  [ELEMENT_TYPES.IMAGE]: ImageStylePanel,
  [ELEMENT_TYPES.SHAPE]: ShapeStylePanel,
  [ELEMENT_TYPES.LINE]: LineStylePanel,
  [ELEMENT_TYPES.CHART]: ChartStylePanel,
  [ELEMENT_TYPES.TABLE]: TableStylePanel,
  [ELEMENT_TYPES.LATEX]: LatexStylePanel,
  [ELEMENT_TYPES.VIDEO]: VideoStylePanel,
  [ELEMENT_TYPES.AUDIO]: AudioStylePanel,
};

const { handleElement } = storeToRefs(useMainStore());

const currentPanelComponent = computed<unknown>(() => {
  return handleElement.value ? panelMap[handleElement.value.type] || null : null;
});
</script>
