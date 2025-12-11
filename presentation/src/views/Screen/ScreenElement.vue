<template>
  <div
    class="screen-element"
    :class="{ link: elementInfo.link }"
    :id="`screen-element-${elementInfo.id}`"
    :style="{
      zIndex: elementIndex,
      color: theme.fontColor,
      fontFamily: theme.fontName,
      visibility: needWaitAnimation ? 'hidden' : 'visible',
    }"
    :title="elementInfo.link?.target || ''"
    @click="($event) => openLink($event)"
  >
    <component :is="currentElementComponent" :elementInfo="elementInfo"></component>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useSlidesStore } from '@/store';
import { ELEMENT_TYPES, type PPTElement } from '@/types/slides';

import BaseImageElement from '@/views/components/element/ImageElement/BaseImageElement.vue';
import BaseTextElement from '@/views/components/element/TextElement/BaseTextElement.vue';
import BaseShapeElement from '@/views/components/element/ShapeElement/BaseShapeElement.vue';
import BaseLineElement from '@/views/components/element/LineElement/BaseLineElement.vue';
import BaseChartElement from '@/views/components/element/ChartElement/BaseChartElement.vue';
import BaseTableElement from '@/views/components/element/TableElement/BaseTableElement.vue';
import BaseLatexElement from '@/views/components/element/LatexElement/BaseLatexElement.vue';
import ScreenVideoElement from '@/views/components/element/VideoElement/ScreenVideoElement.vue';
import ScreenAudioElement from '@/views/components/element/AudioElement/ScreenAudioElement.vue';

const props = defineProps<{
  elementInfo: PPTElement;
  elementIndex: number;
  animationIndex: number;
  turnSlideToId: (id: string) => void;
  manualExitFullscreen: () => void;
}>();

const currentElementComponent = computed<unknown>(() => {
  const elementTypeMap = {
    [ELEMENT_TYPES.IMAGE]: BaseImageElement,
    [ELEMENT_TYPES.TEXT]: BaseTextElement,
    [ELEMENT_TYPES.SHAPE]: BaseShapeElement,
    [ELEMENT_TYPES.LINE]: BaseLineElement,
    [ELEMENT_TYPES.CHART]: BaseChartElement,
    [ELEMENT_TYPES.TABLE]: BaseTableElement,
    [ELEMENT_TYPES.LATEX]: BaseLatexElement,
    [ELEMENT_TYPES.VIDEO]: ScreenVideoElement,
    [ELEMENT_TYPES.AUDIO]: ScreenAudioElement,
  };
  return elementTypeMap[props.elementInfo.type] || null;
});

const { formatedAnimations, theme } = storeToRefs(useSlidesStore());

// Determine if the element needs to wait for entrance animation: elements waiting for entrance should be hidden first
const needWaitAnimation = computed(() => {
  // The position of this element in the animation sequence of this page
  const elementIndexInAnimation = formatedAnimations.value.findIndex((item) => {
    const elIds = item.animations.map((item) => item.elId);
    return elIds.includes(props.elementInfo.id);
  });

  // This element has not been set with animation
  if (elementIndexInAnimation === -1) return false;

  // If this element has already executed animation, it does not need to be hidden
  // Specifically: if the last executed animation is entrance, it obviously does not need to be hidden; if the last executed animation is exit, since the exit animation end state is retained, no extra hiding is needed
  if (elementIndexInAnimation < props.animationIndex) return false;

  // If this element has not executed animation, get its first animation to be executed
  // If the first animation to be executed is entrance, it needs to be hidden, otherwise it does not need to be hidden
  const firstAnimation = formatedAnimations.value[elementIndexInAnimation].animations.find(
    (item) => item.elId === props.elementInfo.id
  );
  if (firstAnimation?.type === 'in') return true;
  return false;
});

// Open the hyperlink bound to the element
const openLink = (e: MouseEvent) => {
  if ((e.target as HTMLElement).tagName === 'A') {
    props.manualExitFullscreen();
    return;
  }

  const link = props.elementInfo.link;
  if (!link) return;

  if (link.type === 'web') {
    props.manualExitFullscreen();
    window.open(link.target);
  } else if (link.type === 'slide') {
    props.turnSlideToId(link.target);
  }
};
</script>

<style lang="scss" scoped>
.link {
  cursor: pointer;
}
</style>
